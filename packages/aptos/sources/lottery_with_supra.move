module lottery_address::lottery {
    use std::vector;
    use std::signer;
    use supra_framework::coin;
    use supra_framework::supra_coin::SupraCoin;
    use supra_framework::timestamp;
    use supra_framework::account;
    use aptos_std::table;
    use supra_addr::supra_vrf;

    // Error codes
    const ENO_LOTTERY: u64 = 1;
    const ELOTTERY_ALREADY_EXISTS: u64 = 2;
    const ELOTTERY_ALREADY_DRAWN: u64 = 3;
    const ELOTTERY_NOT_DRAWN: u64 = 4;
    const EINSUFFICIENT_BALANCE: u64 = 5;
    const ENO_PARTICIPANTS: u64 = 6;
    const ENO_NOT_MODULE_OWNER: u64 = 7;
    const ELOTTERY_DIDNT_END: u64 = 8;

    const MODULE_OWNER: address = @lottery_address;
    const LOTTERY_PRICE: u64 = 10000000;

    // Struct to store the lottery details
    struct Lottery has store, key, drop {
        participants: vector<address>,
        winner: address,
        prize: u64,
        is_drawn: bool,
        start_time: u64,
        end_time: u64,
        nonce: u64,
    }

    struct SignerCapabilityStore has key {
        signer_cap: account::SignerCapability
    }

    struct GlobalTable has key {
        lotteryCounter: u64,
        lotteryTable: table::Table<u64, Lottery>,
    }

    // Initialize the lottery
    public entry fun initialize(deployer: &signer) {
        assert!(signer::address_of(deployer) == MODULE_OWNER, ENO_NOT_MODULE_OWNER);

        // Initialize a resource account that maintains the list of lotteries
        let (_resource, signer_cap) = account::create_resource_account(deployer, vector::empty());

        let rsrc_acc_signer = account::create_signer_with_capability(&signer_cap);

        coin::register<SupraCoin>(&rsrc_acc_signer);

        // Initialize the global table
        move_to(deployer, GlobalTable {
            lotteryCounter: 0,
            lotteryTable: table::new<u64, Lottery>(),
        });

        move_to(deployer, SignerCapabilityStore{
            signer_cap,
        });
    }

    // Create a new lottery
    public entry fun createLottery(admin: &signer, duration: u64) acquires GlobalTable {
        assert!(signer::address_of(admin) == MODULE_OWNER, ENO_NOT_MODULE_OWNER);
        let global_table_resource = borrow_global_mut<GlobalTable>(MODULE_OWNER);
        let counter = global_table_resource.lotteryCounter + 1;

        let currentTime = timestamp::now_seconds();
        let newLottery = Lottery {
            participants: vector::empty<address>(),
            winner: @0x0,
            prize: 0,
            is_drawn: false,
            start_time: currentTime,
            end_time: currentTime + duration,
            nonce: 0,
        };

        table::add(&mut global_table_resource.lotteryTable, counter, newLottery);
        global_table_resource.lotteryCounter = counter;
    }

    // Buy a lottery ticket
    public entry fun buyTicket(buyer: &signer, lotteryId: u64) acquires GlobalTable, SignerCapabilityStore {
        let global_table_resource = borrow_global_mut<GlobalTable>(MODULE_OWNER);
        let lottery = table::borrow_mut(&mut global_table_resource.lotteryTable, lotteryId);
        assert!(!lottery.is_drawn, ELOTTERY_ALREADY_DRAWN);

        let signer_cap_resource = borrow_global_mut<SignerCapabilityStore>(MODULE_OWNER);
        let rsrc_acc_signer = account::create_signer_with_capability(&signer_cap_resource.signer_cap);
        let rsrc_acc_address = signer::address_of(&rsrc_acc_signer);

        let buyer_address = signer::address_of(buyer);
        let buyer_balance = coin::balance<SupraCoin>(buyer_address);
        assert!(buyer_balance >= LOTTERY_PRICE, EINSUFFICIENT_BALANCE);

        coin::transfer<SupraCoin>(buyer, rsrc_acc_address, LOTTERY_PRICE);
        lottery.prize = lottery.prize + LOTTERY_PRICE;
        vector::push_back(&mut lottery.participants, buyer_address);
    }

    // Draw the lottery winner using Supra VRF
    #[randomness]
    public(friend) entry fun draw_winner(admin: &signer, lotteryId: u64) acquires GlobalTable {
        assert!(signer::address_of(admin) == MODULE_OWNER, ENO_NOT_MODULE_OWNER);
        let global_table_resource = borrow_global_mut<GlobalTable>(MODULE_OWNER);
        let lottery = table::borrow_mut(&mut global_table_resource.lotteryTable, lotteryId);

        assert!(!lottery.is_drawn, ELOTTERY_ALREADY_DRAWN);
        assert!(timestamp::now_seconds() >= lottery.end_time, ELOTTERY_DIDNT_END);
        assert!(!vector::is_empty(&lottery.participants), ENO_PARTICIPANTS);

        // Request a random number from Supra VRF
        let callback_address = MODULE_OWNER;
        let callback_module = std::string::utf8(b"lottery");
        let callback_function = std::string::utf8(b"verify_winner");
        let nonce = supra_vrf::rng_request(admin, callback_address, callback_module, callback_function, 1, 0, 1);

        lottery.nonce = nonce;
    }

    // Verify the winner using the random number from Supra VRF
    public entry fun verify_winner(
        nonce: u64,
        message: vector<u8>,
        signature: vector<u8>,
        caller_address: address,
        rng_count: u8,
        client_seed: u64
    ) acquires GlobalTable, SignerCapabilityStore {
        let verified_num: vector<u64> = supra_vrf::verify_callback(nonce, message, signature, caller_address, rng_count, client_seed);
        assert!(vector::length(&verified_num) == 1, ELOTTERY_DIDNT_END);

        let global_table_resource = borrow_global_mut<GlobalTable>(MODULE_OWNER);
        let lottery = table::borrow_mut(&mut global_table_resource.lotteryTable, nonce);

        let participants_count = vector::length(&lottery.participants);
        let first_verified_num = *vector::borrow(&verified_num, 0);
        let winner_index = first_verified_num % participants_count;
        let winner_address = *vector::borrow(&lottery.participants, winner_index as u64);

        lottery.winner = winner_address;

        let signer_cap_resource = borrow_global_mut<SignerCapabilityStore>(MODULE_OWNER);
        let (rsrc_acc_signer, _rsrc_acc_address) = get_rsrc_acc(signer_cap_resource);

        coin::transfer<SupraCoin>(&rsrc_acc_signer, winner_address, lottery.prize);
        lottery.is_drawn = true;
    }

    fun get_rsrc_acc(signer_cap_resource: &SignerCapabilityStore): (signer, address) {
        let rsrc_acc_signer = account::create_signer_with_capability(&signer_cap_resource.signer_cap);
        let rsrc_acc_addr = signer::address_of(&rsrc_acc_signer);

        (rsrc_acc_signer, rsrc_acc_addr)
    }

    // View functions
    #[view]
    public fun get_ticket_price(): u64 {
        LOTTERY_PRICE
    }

    #[view]
    public fun get_prize_amount(lotteryId: u64): u64 acquires GlobalTable {
        let global_table_resource = borrow_global<GlobalTable>(MODULE_OWNER);
        let lottery = table::borrow(&global_table_resource.lotteryTable, lotteryId);
        lottery.prize
    }

    #[view]
    public fun get_participants_count(lotteryId: u64): u64 acquires GlobalTable {
        let global_table_resource = borrow_global<GlobalTable>(MODULE_OWNER);
        let lottery = table::borrow(&global_table_resource.lotteryTable, lotteryId);
        vector::length(&lottery.participants)
    }

    #[view]
    public fun is_lottery_drawn(lotteryId: u64): bool acquires GlobalTable {
        let global_table_resource = borrow_global<GlobalTable>(MODULE_OWNER);
        let lottery = table::borrow(&global_table_resource.lotteryTable, lotteryId);
        lottery.is_drawn
    }

    #[view]
    public fun get_winner(lotteryId: u64): address acquires GlobalTable {
        let global_table_resource = borrow_global<GlobalTable>(MODULE_OWNER);
        let lottery = table::borrow(&global_table_resource.lotteryTable, lotteryId);
        assert!(lottery.is_drawn, ELOTTERY_NOT_DRAWN);
        lottery.winner
    }

    #[view]
    public fun get_lottery_duration(lotteryId: u64): u64 acquires GlobalTable {
        let global_table_resource = borrow_global<GlobalTable>(MODULE_OWNER);
        let lottery = table::borrow(&global_table_resource.lotteryTable, lotteryId);
        lottery.end_time - lottery.start_time
    }

    #[view]
    public fun get_lottery_end_time(lotteryId: u64): u64 acquires GlobalTable {
        let global_table_resource = borrow_global<GlobalTable>(MODULE_OWNER);
        let lottery = table::borrow(&global_table_resource.lotteryTable, lotteryId);
        lottery.end_time
    }

    #[view]
    public fun get_last_lottery_id(): u64 acquires GlobalTable {
        let global_table_resource = borrow_global<GlobalTable>(MODULE_OWNER);
        global_table_resource.lotteryCounter
    }
}
