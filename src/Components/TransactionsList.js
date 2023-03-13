import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CardActionArea, Chip } from '@mui/material';
import logo from '../logo.svg';
import '../App.css';
import { useGlobalState } from './GlobalState';

function TransactionList() {
    const [outboundTransactions, setOutboundTransactions] = useState([]);
    const [inboundTransactions, setInboundTransactions] = useState([]);
    const [walletAddress, setWalletAddress] = useState("");
    const [searchClicked, setSearchClicked] = useState(false);
    const [network, setNetwork] = useState("Ethereum");
    const [Loading, setLoading] = useState(true);
    const [globalState, setGlobalState] = useGlobalState();
    const ethererumAPIKey = "JPX7Z89GQBZC53W1Z4C5QFUJ18Y4IYR31F";
    const ethererumAPIUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&apikey=${ethererumAPIKey}`;

    const fetchSolanaTransactions = async (address, numTxt) => {
        //import Solana and create Solana conncetion
        const solanaWeb3 = require('@solana/web3.js');
        const endPoint = 'https://morning-hidden-borough.solana-mainnet.discover.quiknode.pro/082d71ec6cc4267aa35fa96a1ac74df4441aa5d8/';
        const solanaConnection = new solanaWeb3.Connection(endPoint);
        setLoading(false);

        const solanaAmountNormalizationValue = 1000000;
        const publicKey = new solanaWeb3.PublicKey(address);

        //Retrieving data from Solana API
        let transList = await solanaConnection.getSignaturesForAddress(publicKey, { limit: numTxt });
        let signatureList = transList.map(transaction => transaction.signature);
        let TransactionDetails = await solanaConnection.getParsedTransactions(signatureList);
        let isCrossChain = false;
        const List = [];

        transList.forEach(async (transaction, index) => {
            let fromAddress;
            let toAddress;
            let amount;
            const transactionIntruction = TransactionDetails[index].transaction.message.instructions;
            fromAddress = transactionIntruction[0].parsed.info.source;
            toAddress = transactionIntruction[0].parsed.info.destination;
            amount = transactionIntruction[0].parsed.info.lamports;

            //Finding amount from crosschain
            if (amount == undefined) {
                TransactionDetails.map((test) => {
                    amount = test.meta.innerInstructions[1].instructions[1].parsed.info.amount / solanaAmountNormalizationValue;
                })
            } else {
                amount = transactionIntruction[0].parsed.info.lamports / solanaAmountNormalizationValue;
            }

            //Find out is it crosschain or not
            if (toAddress == undefined) {
                isCrossChain = true;
                toAddress = walletAddress;
            } else {
                isCrossChain = false;
            }

            List.push({
                hash: transaction.signature,
                timeStamp: transaction.blockTime,
                blockNumber: transaction.slot,
                from: fromAddress,
                to: toAddress,
                isCrossChain: isCrossChain,
                value: amount,
                network: network
            })
        });

        const InBound = List.filter(tx => tx.to.includes(walletAddress));
        const OutBound = List.filter(tx => tx.from.includes(walletAddress));
        setInboundTransactions(inboundTransactions => [...inboundTransactions, ...InBound]);
        setOutboundTransactions(outboundTransactions => [...outboundTransactions, ...OutBound]);
        setLoading(true);
    }

    //Create method to get amount in Ethereum Swap and Bridge transaction
    const fetchAmountForEthereumSwapAndBridgeTransaction = async (walletAddress, txhash) => {
        const contractAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
        const startBlock = "0";
        const endBlock = "latest";
        const solanaAPIUrl = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${contractAddress}&address=${walletAddress}&startblock=${startBlock}&endblock=${endBlock}&sort=asc&apikey=${ethererumAPIKey}`;

        try {
            const response = await fetch(solanaAPIUrl);
            const data = await response.json();
            const getHashStatus = await data.result.filter(tx => tx.hash == txhash).slice(0, 1).shift();
            return getHashStatus;
        } catch (error) {
            console.error(error);
        }
    }

    //Create method to get transaction from Ethereum network
    const fetchEthereumTransactions = async () => {
        const ethereumNormalizationValue = 1000000;
        setLoading(false);
        if (!walletAddress) {
            return;
        }
        try {
            const response = await fetch(ethererumAPIUrl);
            const data = await response.json();
            const List = [];
            if (data.status === "1") {
                for (const tx of data.result) {
                    let value = 0;
                    let isCrossChain = false;
                    if (tx.methodId == "0xf35e37d3") {
                        const getFilteredData = await fetchAmountForEthereumSwapAndBridgeTransaction(walletAddress, tx.hash);
                        isCrossChain = true;
                        value = parseInt(getFilteredData.value);
                    }
                    else {
                        value = tx.value;
                        isCrossChain = false;

                    }
                    const amount = parseInt(value) / ethereumNormalizationValue;
                    const time = parseInt(tx.timeStamp);
                    List.push({
                        hash: tx.hash,
                        timeStamp: time,
                        blockNumber: tx.blockNumber,
                        from: tx.from,
                        to: tx.to,
                        isCrossChain: isCrossChain,
                        value: amount,
                        network: network
                    });
                }

                const OutBound = List.filter(tx => tx.from.includes(walletAddress.toLowerCase()));
                const InBound = List.filter(tx => tx.to.includes(walletAddress.toLowerCase()));
                setOutboundTransactions(outboundTransactions => [...outboundTransactions, ...OutBound]);
                setInboundTransactions(inboundTransactions => [...inboundTransactions, ...InBound]);
                setLoading(true);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        async function effectHandler() {
            if (searchClicked) {
                if (network == "Ethereum") {
                    await fetchEthereumTransactions();
                    setSearchClicked(false);
                }
                else if (network == "Solana") {
                    await fetchSolanaTransactions(walletAddress, 1000);
                    setSearchClicked(false);
                }
            }
        };
        effectHandler();
    }, [searchClicked, walletAddress, ethererumAPIUrl]);

    useEffect(() => {
        if (globalState.inBound) {
            setInboundTransactions(globalState.inBound);
        }
        if (globalState.outBound) {
            setOutboundTransactions(globalState.outBound);
        }
    }, [])

    const clearList = () => {
        setInboundTransactions([]);
        setOutboundTransactions([]);
        setGlobalState({ outBound: [], inBound: [] })
    }

    const handleWalletAddressChange = (event) => {
        setWalletAddress(event.target.value);
    };

    const handleSearchClick = () => {
        setLoading(false);
        let Status = false;

        //Outbound
        if (outboundTransactions == "") {
            setSearchClicked(true);
        } else {
            outboundTransactions.forEach((tx) => {
                if (tx.from == walletAddress.toLowerCase() || tx.from == walletAddress) {
                    Status = true;
                }
                else {
                    Status = false
                    setSearchClicked(true);
                }
            })

            if (Status) {
                alert("This Wallet Address Entered Earlier");
                setSearchClicked(false);
                setLoading(true);
            } else {
                setSearchClicked(true);
            }
        }

        //Inbound
        if (inboundTransactions == "") {
            setSearchClicked(true);
        } else {
            inboundTransactions.forEach((tx) => {
                if (tx.to === walletAddress || tx.to === walletAddress.toLowerCase()) {
                    Status = true;
                }
                else {
                    Status = false;
                }
            })

            if (Status) {
                alert("This Wallet Address Entered Earlier");
                setLoading(true);
                setSearchClicked(false);
            } else {
                setSearchClicked(true);
            }
        }
    };

    const handleNetworkChange = (event) => {
        setNetwork(event.target.value);
    }

    const handlePassParams = () => {
        setGlobalState({ ...globalState, outBound: outboundTransactions, inBound: inboundTransactions });
    }

    return (
        <div>
            <header>
                <img src={logo} width="208" height="33" className='logo' />
                <div className="container">
                    <div className='row'>
                        <div className='col'>
                            <ul className='d-flex'>
                                <li>
                                    <input className="form-control" placeholder="Enter wallet address" type="text" value={walletAddress} onChange={handleWalletAddressChange} />
                                </li>
                                <li>
                                    <select className="form-select" value={network} onChange={handleNetworkChange}>
                                        <option value="Ethereum">Ethereum</option>
                                        <option value="Solana">Solana</option>
                                    </select>
                                </li>
                                <li>
                                    <button className="btn btn-primary" onClick={handleSearchClick} >Search transaction</button>
                                </li>
                                <li>
                                    <Link onClick={handlePassParams} to="/matching" className='btn btn-primary-outline'>Match transaction</Link>
                                </li>
                                <li>
                                    <Link onClick={clearList} className='px-4 btn btn-primary-outline'>Clear</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <label className='loading' type="text">{Loading ? "" : "Data is loading..."}</label>
            </header>

            <main className="container">
                <div className='row gx-5'>
                    <div className="col-6">
                        <h3>Outbound Transaction</h3>
                        <div className='card-holder'>
                            {outboundTransactions.map((tx) => {
                                return (
                                    <Card key={tx.hash} sx={{ maxWidth: 700 }}>
                                        <CardActionArea>
                                            <CardContent>
                                                <Typography gutterBottom className="title" component="div" style={{ fontWeight: '600' }}>
                                                    <Chip sx={{ m: .5 }} label={tx.network}></Chip>
                                                    {tx.isCrossChain ?
                                                        <Chip label="CROSSCHAIN"></Chip>
                                                        :
                                                        <span></span>
                                                    }
                                                    <Chip sx={{ m: .5 }} label={`BN : ${tx.blockNumber}`}></Chip>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>Transaction Hash:</h4>
                                                    <label className='sml'>{tx.hash}</label>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>Amount:</h4>
                                                    <label>{tx.value}</label>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>Timestamp:</h4>
                                                    <label>{new Date(parseInt(tx.timeStamp) * 1000).toLocaleString()}</label>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>From:</h4>
                                                    <label>{tx.from}</label>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>To:</h4>
                                                    <label>{tx.to}</label>
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    <div className="col-6 block-inbound">
                        <h3>Inbound Transaction</h3>
                        <div className='card-holder'>
                            {inboundTransactions.map((tx) => {
                                return (
                                    <Card key={tx.hash} sx={{ maxWidth: 600 }}>
                                        <CardActionArea>
                                            <CardContent>
                                                <Typography gutterBottom className="title" component="div" style={{ fontWeight: '600' }}>
                                                    <Chip sx={{ m: .5 }} label={tx.network}></Chip>
                                                    {tx.isCrossChain ?
                                                        <Chip label="CROSSCHAIN"></Chip>
                                                        :
                                                        <span></span>
                                                    }
                                                    <Chip sx={{ m: .5 }} label={`BN : ${tx.blockNumber}`}></Chip>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>Transaction Hash:</h4>
                                                    <label>{tx.hash}</label>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>Amount:</h4>
                                                    <label>{tx.value}</label>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>Timestamp:</h4>
                                                    <label>{new Date(parseInt(tx.timeStamp) * 1000).toLocaleString()}</label>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>From:</h4>
                                                    <label>{tx.from}</label>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>To:</h4>
                                                    <label>{tx.to}</label>
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default TransactionList;