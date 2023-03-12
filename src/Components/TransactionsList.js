import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import logo from '../logo.svg';
import '../App.css';
import { useGlobalState } from './GlobalState';
const solanaWeb3 = require('@solana/web3.js');
const endPoint = 'https://morning-hidden-borough.solana-mainnet.discover.quiknode.pro/082d71ec6cc4267aa35fa96a1ac74df4441aa5d8/';
const solanaConnection = new solanaWeb3.Connection(endPoint);

function TransactionList() {

    const [outboundTransactions, setOutboundTransactions] = useState([]);
    const [inboundTransactions, setInboundTransactions] = useState([]);
    const [walletAddress, setWalletAddress] = useState("");
    const [searchClicked, setSearchClicked] = useState(false);
    const [network, setNetwork] = useState("Ethereum");
    const [Loading, setLoading] = useState(true);
    const apiKey = "JPX7Z89GQBZC53W1Z4C5QFUJ18Y4IYR31F";
    const apiUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&apikey=${apiKey}`;
    const [globalState, setGlobalState] = useGlobalState();
    const [encoded, setEncode] = useState('');

    const fetchSolanaTransactions = async (address, numTxt) => {
        setLoading(false);
        const publicKey = new solanaWeb3.PublicKey(address);
        let transList = await solanaConnection.getSignaturesForAddress(publicKey, { limit: numTxt });
        let signatureList = transList.map(transaction => transaction.signature);
        let TransactionDetails = await solanaConnection.getParsedTransactions(signatureList);
        const List = [];
        let IsBridge = "false";
        console.log(TransactionDetails);
        transList.forEach(async (transaction, index) => {
            const date = new Date(transaction.blockTime * 1000);
            const transactionIntruction = TransactionDetails[index].transaction.message.instructions;
            const dateString = `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}, ${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}`
            let fromAddress;
            let toAddress;
            let amount;
            fromAddress = transactionIntruction[0].parsed.info.source;
            toAddress = transactionIntruction[0].parsed.info.destination;
            amount = transactionIntruction[0].parsed.info.lamports;
            console.log(typeof transaction.blockTime);
            if (amount == undefined) {
                TransactionDetails.map((test) => {
                    amount = test.meta.innerInstructions[1].instructions[1].parsed.info.amount / 1000000;
                })
            } else {
                amount = transactionIntruction[0].parsed.info.lamports;
            }

            if (toAddress == undefined) {
                IsBridge = "true";
                toAddress = walletAddress;
            } else {
                IsBridge = "false";
            }
            List.push({
                hash: transaction.signature,
                timeStamp: transaction.blockTime,
                blockNumber: transaction.slot,
                from: fromAddress,
                to: toAddress,
                Status: IsBridge,
                value: amount
            })
        });
        console.log(List);
        const InBound = List.filter(tx => tx.to.includes(walletAddress));
        const OutBound = List.filter(tx => tx.from.includes(walletAddress));
        setInboundTransactions(inboundTransactions => [...inboundTransactions, ...InBound]);
        setOutboundTransactions(outboundTransactions => [...outboundTransactions, ...OutBound]);
        setLoading(true);
    }

    const fetchEthereumTransactions = async () => {
        setLoading(false);
        if (!walletAddress) {
            return;
        }
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            const List = [];
            if (data.status === "1") {
                data.result.map((tx) => {
                    var time = parseInt(tx.timeStamp);
                    var amount = parseInt(tx.value);
                    List.push({
                        hash: tx.hash,
                        timeStamp: time,
                        blockNumber: tx.blockNumber,
                        from: tx.from,
                        to: tx.to,
                        Status: "",
                        value: amount
                    })
                })
                const OutBound = List.filter(tx => tx.from.includes(walletAddress.toLowerCase()));
                const InBound = List.filter(tx => tx.to.includes(walletAddress.toLowerCase()));
                setOutboundTransactions(outboundTransactions => [...outboundTransactions, ...OutBound]);
                setInboundTransactions(inboundTransactions => [...inboundTransactions, ...InBound]);
                console.log(data.result);
                setLoading(true);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
            if (searchClicked) {
                if (network == "Ethereum") {
                    fetchEthereumTransactions();
                    setSearchClicked(false);
                }
                else if (network == "Solana") {
                    fetchSolanaTransactions(walletAddress, 1000);
                    setSearchClicked(false);
                }
            }
               
    }, [searchClicked, walletAddress, apiUrl]);

    useEffect(() => {
        if (globalState.inBound){
            setInboundTransactions(globalState.inBound);
        }
        if (globalState.outBound){
            setOutboundTransactions(globalState.outBound);
        }
    },[])

    const clearList = () => {
        setInboundTransactions([]);
        setOutboundTransactions([]);
        setGlobalState({ outBound: [], inBound: []})
    }

    const handleWalletAddressChange = (event) => {
        setWalletAddress(event.target.value);
    };

    const handleSearchClick = () => {
        setLoading(false);
        let solanaStatus = "";
        if (outboundTransactions == "") {
            setSearchClicked(true);
        } else {
            outboundTransactions.forEach((tx) => {
                if (tx.from == walletAddress.toLowerCase() || tx.from == walletAddress) {
                    solanaStatus = "OK";
                    setLoading(true);
                    setSearchClicked(false);
                }
                else {
                    solanaStatus = "NO"
                    setSearchClicked(true);
                }
            })

            if (solanaStatus == "OK") {
                alert("This Wallet Address Entered Earlier");
                setSearchClicked(false);
                setLoading(true);
            } else if (solanaStatus == "NO") {
                setSearchClicked(true);
            }
        }

        if (inboundTransactions == "") {
            setSearchClicked(true);
        } else {
            inboundTransactions.forEach((tx) => {
                if (tx.to === walletAddress || tx.to === walletAddress.toLowerCase()) {
                    solanaStatus = "OK";
                    setLoading(true);
                    setSearchClicked(false);
                }
                else {
                    solanaStatus = "NO"
                    setSearchClicked(true);
                }
            })

            if (solanaStatus == "OK") {
                alert("This Wallet Address Entered Earlier");
                setLoading(true);
                setSearchClicked(false);
            } else if (solanaStatus == "NO") {
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
                                    <Link onClick={clearList} className='px-4'>Clear</Link>
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
                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>Transaction Hash:</h4> 
                                                    <label className='sml'>{tx.hash}</label>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>Block Number:</h4> 
                                                    <label>{tx.blockNumber}</label>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>Amount:</h4> 
                                                    <label>{tx.value}</label>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>Timestamp:</h4>
                                                    <label>{new Date(parseInt(tx.timeStamp) * 1000).toLocaleString()}</label>
                                                </Typography>

                                                {tx.Status === "true" ?
                                                    <Typography gutterBottom className="title" component="div" style={{ fontWeight: '600' }}>
                                                        Is Bridge: {tx.Status}
                                                    </Typography>
                                                    :
                                                    <div></div>
                                                }

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
                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>Transaction Hash:</h4>
                                                    <label>{tx.hash}</label>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>Block Number:</h4>
                                                    <label>{tx.blockNumber}</label>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>Amount:</h4>
                                                    <label>{tx.value}</label>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>Timestamp:</h4>
                                                    <label>{new Date(parseInt(tx.timeStamp) * 1000).toLocaleString()}</label>
                                                </Typography>

                                                {tx.Status === "true" ?
                                                    <Typography gutterBottom className="title" component="div" style={{ fontWeight: '600' }}>
                                                        Is Bridge : {tx.Status}
                                                    </Typography>
                                                    :
                                                    <div></div>
                                                }

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