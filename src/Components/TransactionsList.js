import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
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
            <div className='Menu'>
                <div className="container d-flex">
                    <p className="me-2" placeholder="Search" type="text" style={{ color: 'white' }}>{Loading ? "" : "Loading Data"}</p>
                    <input className="form-control text-box me-2" placeholder="Search" type="text" value={walletAddress} onChange={handleWalletAddressChange} />
                    <select className="form-select select-dropdown me-2" value={network} onChange={handleNetworkChange}>
                        <option value="Ethereum">Ethereum</option>
                        <option value="Solana">Solana</option>
                    </select>
                    <button className="btn btn-outline-success" onClick={handleSearchClick} >Search</button>
                    <Link onClick={handlePassParams} to="/matching" className='btn btn-primary margin-left-button'>Matching</Link>
                    <button className='btn btn-danger margin-left-button' onClick={clearList}>Clear</button>

                </div>
            </div>

            <div className="row right-column-margin">
                <div className="col-6 col-md-5 list-margin">
                    <p className='fixed-position'><b>Outbound Transaction : </b></p>
                    <div className='list-box'>
                        {outboundTransactions.map((tx) => {
                            return (
                                <Card key={tx.hash} sx={{ maxWidth: 700 }} className="card-margin">
                                    <CardActionArea>
                                        <CardContent>
                                            <Typography gutterBottom className="title" component="div">
                                                Transaction Hash : {tx.hash}
                                            </Typography>

                                            <Typography gutterBottom className="title" component="div">
                                                Block Number : {tx.blockNumber}
                                            </Typography>

                                            <Typography gutterBottom className="title" component="div">
                                                Amount : {tx.value}
                                            </Typography>

                                            <Typography gutterBottom className="title" component="div">
                                                Timestamp : {new Date(parseInt(tx.timeStamp) * 1000).toLocaleString()}
                                            </Typography>

                                            {tx.Status === "true" ?
                                                <Typography gutterBottom className="title" component="div" style={{ fontWeight: '600' }}>
                                                    Is Bridge : {tx.Status}
                                                </Typography>
                                                :
                                                <div></div>
                                            }

                                            <Typography gutterBottom className="title" component="div">
                                                From : {tx.from}
                                            </Typography>

                                            <Typography gutterBottom className="title" component="div">
                                                To : {tx.to}
                                            </Typography>

                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            );
                        })}
                    </div>

                </div>
                <div className="col-6 col-md-5 list-margin">
                    <p className='fixed-position'><b>Inbound Transaction : </b></p>
                    <div className='list-box'>
                        {inboundTransactions.map((tx) => {
                            return (
                                <Card key={tx.hash} sx={{ maxWidth: 600 }} className="card-margin">
                                    <CardActionArea>
                                        <CardContent>
                                            <Typography gutterBottom className="title" component="div">
                                                Transaction Hash : {tx.hash}
                                            </Typography>

                                            <Typography gutterBottom className="title" component="div">
                                                Block Number : {tx.blockNumber}
                                            </Typography>

                                            <Typography gutterBottom className="title" component="div">
                                                Amount : {tx.value}
                                            </Typography>

                                            <Typography gutterBottom className="title" component="div">
                                                Timestamp : {new Date(parseInt(tx.timeStamp) * 1000).toLocaleString()}
                                            </Typography>

                                            {tx.Status === "true" ?
                                                <Typography gutterBottom className="title" component="div" style={{ fontWeight: '600' }}>
                                                    Is Bridge : {tx.Status}
                                                </Typography>
                                                :
                                                <div></div>
                                            }

                                            <Typography gutterBottom className="title" component="div">
                                                From : {tx.from}
                                            </Typography>

                                            <Typography gutterBottom className="title" component="div">
                                                To : {tx.to}
                                            </Typography>

                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TransactionList;