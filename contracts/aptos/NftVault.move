module NftVault::NftManager {
    use Std::error;
    use Std::signer;
    use Aptos::token;

    const E_NOT_OWNER: u64 = 1001;

    public fun mint_nft(
        minter: &signer,
        collection_name: &str,
        token_name: &str,
        token_uri: &str
    ) {
        token::mint(
            minter,
            collection_name,
            token_name,
            1,
            token_uri,
            false,
            minter,
            0,
            0,
            vec![],
            vec![],
            vec![]
        );
    }
}
