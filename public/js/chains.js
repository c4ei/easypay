const goerliChainId = 5;
const polygonChainId = 137;
const c4eiChainId = 21004;

const jsfn_start = () => {
    let web3;
    connect = async() => {
        const {ethereum} = window;
        if(ethereum) {
            console.log("ethreum provider detected");
            await ethereum.request({method: 'eth_requestAccounts'});
            web3 = new Web3(ethereum);
            await switchNetwork(c4eiChainId);
        }
    }

    getCurrentChainId = async () => {
        const currentChainId = await web3.eth.getChainId();
        console.log("current chainId:", currentChainId);
        return currentChainId;
    }

    switchNetwork = async (chainId) => {
        const currentChainId = await web3.eth.getChainId();
        if (currentChainId != chainId){
            try {
                await ethereum.request({
                    method:'wallet_switchEthereumChain',
                    params: [{chainId: Web3.utils.toHex(chainId)}]
                });
                console.log(`switched to chainid : ${chainId} succesfully`);
            }catch(err){
                console.log(`error occured while switching chain to chainId ${chainId}, err: ${err.message} code: ${err.code}`);
                if (err.code === 4902){
                    addNetwork(c4eiNetwork);
                }
            }
        }
    }

    const c4eiNetwork = {
        chainId:Web3.utils.toHex(c4eiChainId),
        chainName: "C4EI",
        nativeCurrency: {
          name: "C4EI",
          symbol: "C4EI", // 2-6 characters long
          decimals: 18
        },
        rpcUrls: ["https://rpc.c4ei.net/"],
        blockExplorerUrls:["https://exp.c4ei.net/"],
        iconUrls: ["https://c4ei.net/c4ei.svg", "https://c4ei.net/c4ei.png"]
    }

    const polygonNetwork = {
        chainId:Web3.utils.toHex(polygonChainId),
        chainName: "Polygon Mainnet",
        nativeCurrency: {
          name: "MATIC",
          symbol: "MATIC", // 2-6 characters long
          decimals: 18
        },
        rpcUrls: ["https://polygon-rpc.com/"],
        blockExplorerUrls:["https://polygonscan.com/"]
    }

    addNetwork = async(networkDetails) => {
        try{
            await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                    networkDetails
                ]
              });
        }catch(err){
            console.log(`error ocuured while adding new chain with chainId:${networkDetails.chainId}, err: ${err.message}`)
        }
    }
    
    connect();
}

window.addEventListener('DOMContentLoaded', jsfn_start);
