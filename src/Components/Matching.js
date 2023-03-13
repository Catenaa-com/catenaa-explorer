import React, { useEffect, useState } from 'react';
import { useGlobalState } from './GlobalState';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CardActionArea, Chip } from '@mui/material';
import { Link } from 'react-router-dom';

function Matching() {
    const [globalState] = useGlobalState();
    const [dataList, setDataList] = useState([]);

    //eulidean distance algorithm use to matching Outbound and Inbound transaction
    const euclideanDistance = (obj1, obj2) => {
        const baseTimeStamp = 1577836860; //Wednesday, January 1, 2020 12:01:00 AM
        const diffTimestamp = (obj1.timeStamp - baseTimeStamp) - (obj2.timeStamp - baseTimeStamp);
        const diffAmount = obj1.value - obj2.value;
        return Math.sqrt(diffTimestamp * diffTimestamp + diffAmount * diffAmount);
    };

    //Get data from transaction list component using global state
    const getData = () => {
        let outBound = globalState.outBound.filter((tx) => tx.isCrossChain == true);
        let inBound = globalState.inBound.filter((tx) => tx.isCrossChain == true);
        let distances = [];

        outBound.map((outTxn) => {
            const inBoundTxnWithDistance = [];
            inBound.map((inTxn) => {
                let distance = euclideanDistance(outTxn, inTxn);
                inBoundTxnWithDistance.push({
                    inboundTxn: inTxn,
                    distance: distance,
                });
            });
            distances.push({
                outboundTxn: outTxn,
                mappedInboundTxns: inBoundTxnWithDistance,
            });
        });
        setDataList(dataList => [...dataList, ...distances]);
    }

    useEffect(() => {
        getData();
    }, [])

    return (
        <div>
            <header className='inner'>
                <Link to='/'> Back</Link>
                <h3>Matching Transaction Results</h3>
            </header>
            <main className="container inner">
                <div className='row'>
                    <div className="col">
                        {dataList.map((distanceObj, i) => {
                            console.log(distanceObj.outboundTxn.hash);
                            return (
                                <div>
                                    <Card key={distanceObj.outboundTxn.hash} className="card-margin">
                                        <CardActionArea>
                                            <CardContent>
                                                <Typography gutterBottom className="title" component="div" style={{ fontWeight: '600' }}>
                                                    <Chip sx={{ m: .5 }} label={distanceObj.outboundTxn.network}></Chip>
                                                    {distanceObj.outboundTxn.isCrossChain ?
                                                        <Chip label="CROSSCHAIN"></Chip>
                                                        :
                                                        <span></span>
                                                    }
                                                    <Chip sx={{ m: .5 }} label={`BN : ${distanceObj.outboundTxn.blockNumber}`}></Chip>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>Transaction Hash:</h4>
                                                    <label>{distanceObj.outboundTxn.hash}</label>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>Amount:</h4>
                                                    <label>{distanceObj.outboundTxn.value}</label>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    Timestamp : {new Date(parseInt(distanceObj.outboundTxn.timeStamp) * 1000).toLocaleString()}
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>From:</h4>
                                                    <label>{distanceObj.outboundTxn.from}</label>
                                                </Typography>

                                                <Typography gutterBottom className="title" component="div">
                                                    <h4>To:</h4>
                                                    <label>{distanceObj.outboundTxn.to}</label>
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>

                                    <div className='margin-subList block-inbound'>
                                        {distanceObj.mappedInboundTxns
                                            .sort((a, b) => a.distance - b.distance)
                                            .slice(0, 3)
                                            .map((inTxn) => {
                                                return (
                                                    <div>
                                                        <Card key={inTxn.inboundTxn.hash} className="card-margin">
                                                            <CardActionArea>
                                                                <CardContent>
                                                                    <Typography gutterBottom className="title" component="div" style={{ fontWeight: '600' }}>
                                                                        <Chip sx={{ m: .5 }} label={inTxn.inboundTxn.network}></Chip>
                                                                        {inTxn.inboundTxn.isCrossChain ?
                                                                            <Chip label="CROSSCHAIN"></Chip>
                                                                            :
                                                                            <span></span>
                                                                        }
                                                                        <Chip sx={{ m: .5 }} label={`BN : ${inTxn.inboundTxn.blockNumber}`}></Chip>
                                                                    </Typography>

                                                                    <Typography gutterBottom className="title" component="div">
                                                                        <h4>Transaction Hash:</h4>
                                                                        <label>{inTxn.inboundTxn.hash}</label>
                                                                    </Typography>

                                                                    <Typography gutterBottom className="title" component="div">
                                                                        <h4>Amount:</h4>
                                                                        <label>{inTxn.inboundTxn.value}</label>
                                                                    </Typography>

                                                                    <Typography gutterBottom className="title" component="div">
                                                                        <h4>Timestamp:</h4>
                                                                        <label>{new Date(parseInt(inTxn.inboundTxn.timeStamp) * 1000).toLocaleString()}</label>
                                                                    </Typography>

                                                                    <Typography gutterBottom className="title" component="div">
                                                                        <h4>From:</h4>
                                                                        <label>{inTxn.inboundTxn.from}</label>
                                                                    </Typography>

                                                                    <Typography gutterBottom className="title" component="div">
                                                                        <h4>To:</h4>
                                                                        <label>{inTxn.inboundTxn.to}</label>
                                                                    </Typography>

                                                                    <Typography gutterBottom className="title" component="div">
                                                                        <h4>Distance:</h4>
                                                                        <label>{inTxn.distance}</label>
                                                                    </Typography>
                                                                </CardContent>
                                                            </CardActionArea>
                                                        </Card>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Matching;