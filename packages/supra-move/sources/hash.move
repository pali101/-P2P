module self::micropayment_hash {
    use std::signer;
    use std::string::String;
    use std::hash;
    use aptos_std::table::{Self, Table};
    use std::vector;

    use supra_framework::coin;
    use supra_framework::supra_coin::SupraCoin;
    use supra_framework::account;
    use supra_framework::resource_account;

    const MODULE_OWNER: address = @self;

    // Error codes
    const ENO_SAME_SENDER_RECEIVER: u64 = 0;
    const ENO_NOT_MODULE_OWNER: u64 = 1;
    const E_CHANNEL_ALREADY_REDEEMED: u64 = 2;
    const E_NOT_RECEIVER: u64 = 3;
    const E_INVALID_TOKEN: u64 = 4;

    // A channel structure to hold micropayment channel info
    struct Channel has store, key {
        channel_id: u64,
        sender_address: address,
        receiver_address: address,
        initial_amount: u64,
        total_tokens: u64,
        redeemed: bool,
        trust_anchor: String,
    }

    struct SignerCapabilityStore has key {
        signer_cap: account::SignerCapability
    }

    struct GlobalTable has key {
        channel_table: Table<u64, Channel>,
        channel_counter: u64,
    }

    public entry fun init_deploy(deployer: &signer) {
        assert!(signer::address_of(deployer) == MODULE_OWNER, ENO_NOT_MODULE_OWNER);

        let resourse_signer_cap = resource_account::retrieve_resource_account_cap(deployer, MODULE_OWNER);

        // // Initialize a resource account that maintains the list of channels
        // let (_resource, signer_cap) = account::create_resource_account(deployer, vector::empty());

        // let rsrc_acc_signer = account::create_signer_with_capability(&signer_cap);

        coin::register<SupraCoin>(&resourse_signer_cap);

        // Initialize the global table
        move_to(deployer, GlobalTable {
            // store details of channels into a table
            channel_table: table::new(),
            channel_counter: 0,
        });

        move_to(deployer, SignerCapabilityStore{
            resourse_signer_cap
        });
    }












    fun get_rsrc_acc(signer_cap_resource: &SignerCapabilityStore): (signer, address) {
        let rsrc_acc_signer = account::create_signer_with_capability(&signer_cap_resource.signer_cap);
        let rsrc_acc_addr = signer::address_of(&rsrc_acc_signer);

        (rsrc_acc_signer, rsrc_acc_addr)
    }
}