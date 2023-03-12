import React, { useEffect, useState } from 'react';
import { useGlobalState } from './GlobalState';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import { Link } from 'react-router-dom';

function Matching() {

    const [globalState] = useGlobalState();
    const [dataList, setDataList] = useState([]);

    const euclideanDistance = (obj1, obj2) => {
        const diffTimestamp = obj1.timeStamp - obj2.timeStamp;
        const diffAmount = obj1.value - obj2.value;
        return Math.sqrt(diffTimestamp * diffTimestamp + diffAmount * diffAmount);
    }



    const getData = () => {
        let outBound = globalState.outBound;
        let inBound = globalState.inBound;
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

        console.log(distances);
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
                                    <Typography gutterBottom className="title" component="div">
                                        <h4>Transaction Hash:</h4>
                                        <label>{distanceObj.outboundTxn.hash}</label>
                                    </Typography>

                                    <Typography gutterBottom className="title" component="div">
                                        <h4>Block Number:</h4>
                                        <label>{distanceObj.outboundTxn.blockNumber}</label>
                                    </Typography>

                                    <Typography gutterBottom className="title" component="div">
                                        <h4>Amount:</h4>
                                        <label>{distanceObj.outboundTxn.value}</label>
                                    </Typography>

                                    <Typography gutterBottom className="title" component="div">
                                        Timestamp : {new Date(parseInt(distanceObj.outboundTxn.timeStamp) * 1000).toLocaleString()}
                                    </Typography>

                                    {distanceObj.outboundTxn.Status === "true" ?
                                        <Typography gutterBottom className="title" component="div" style={{ fontWeight: '600' }}>
                                            Is Bridge : {distanceObj.outboundTxn.Status}
                                        </Typography>
                                        :
                                        <div></div>
                                    }
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
                        <div className='margin-subList'>
                            {distanceObj.mappedInboundTxns
                                .sort((a, b) => a.distance - b.distance)
                                .slice(0, 3)
                                .map((inTxn) => {
                                    return (
                                        <div>
                                            <Card key={inTxn.inboundTxn.hash} className="card-margin">
                                                <CardActionArea>
                                                    <CardContent>
                                                        <Typography gutterBottom className="title" component="div">
                                                            <h4>Transaction Hash:</h4>
                                                            <label>{inTxn.inboundTxn.hash}</label>
                                                        </Typography>

                                                        <Typography gutterBottom className="title" component="div">
                                                            <h4>Block Number:</h4>
                                                            <label>{inTxn.inboundTxn.blockNumber}</label>
                                                        </Typography>

                                                        <Typography gutterBottom className="title" component="div">
                                                            <h4>Amount:</h4>
                                                            <label>{inTxn.inboundTxn.value}</label>
                                                        </Typography>

                                                        <Typography gutterBottom className="title" component="div">
                                                            <h4>Timestamp:</h4>
                                                            <label>{new Date(parseInt(inTxn.inboundTxn.timeStamp) * 1000).toLocaleString()}</label>
                                                        </Typography>

                                                        {inTxn.inboundTxn.Status === "true" ?
                                                            <Typography gutterBottom className="title" component="div" style={{ fontWeight: '600' }}>
                                                                Is Bridge : {inTxn.inboundTxn.Status}
                                                            </Typography>
                                                            :
                                                            <div></div>
                                                        }
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
            {/* {sampleJSON.map((tx, i) => {
                return (
                    <div className='margin-subList'>
                        <Card key={i} sx={{ maxWidth: 400 }} className="card-margin">
                            <CardActionArea>
                                <CardContent>
                                    <Typography gutterBottom className="title" component="div">
                                        Name : {tx.name}
                                    </Typography>

                                    <Typography gutterBottom className="title" component="div">
                                        Age : {tx.age}
                                    </Typography>

                                    <Typography gutterBottom className="title" component="div">
                                        Telephone : {tx.tele}
                                    </Typography>

                                </CardContent>
                            </CardActionArea>
                        </Card>

                        {tx.address.map((test, ind) => {
                            return (
                                <div className='margin-subList'>
                                    <Card key={ind} sx={{ maxWidth: 400 }} className="card-margin">
                                        <CardActionArea>
                                            <CardContent>
                                                <Typography gutterBottom className="title" component="div">
                                                    Street : {test.street}
                                                </Typography>
            
                                                <Typography gutterBottom className="title" component="div">
                                                    City : {test.city}
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                    
                                </div>
                            )
                        })}
                    </div>
                )
            })} */}

            {/* {distance.map((tx) => {
                return (
                    <div>
                        <Card key={tx.outBound.hash} sx={{ maxWidth: 400 }} className="card-margin">
                            <CardActionArea>
                                <CardContent>
                                    <Typography gutterBottom className="title" component="div">
                                        Transaction Hash : {tx.outBound.hash}
                                    </Typography>

                                    <Typography gutterBottom className="title" component="div">
                                        Block Number : {tx.outBound.blockNumber}
                                    </Typography>

                                    <Typography gutterBottom className="title" component="div">
                                        Timestamp : {new Date(parseInt(tx.outBound.timeStamp) * 1000).toLocaleString()}
                                    </Typography>

                                    {tx.Status === "true" ?
                                        <Typography gutterBottom className="title" component="div" style={{ fontWeight: '600' }}>
                                            Is Bridge : {tx.outBound.Status}
                                        </Typography>
                                        :
                                        <div></div>
                                    }
                                    <Typography gutterBottom className="title" component="div">
                                        From : {tx.outBound.from}
                                    </Typography>

                                    <Typography gutterBottom className="title" component="div">
                                        To : {tx.outBound.to}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>

                        <div className='margin-subList'>
                            <Card key={tx.inBound.hash} sx={{ maxWidth: 400 }} className="card-margin">
                                <CardActionArea>
                                    <CardContent>
                                        <Typography gutterBottom className="title" component="div">
                                            Transaction Hash : {tx.inBound.hash}
                                        </Typography>

                                        <Typography gutterBottom className="title" component="div">
                                            Block Number : {tx.inBound.blockNumber}
                                        </Typography>

                                        <Typography gutterBottom className="title" component="div">
                                            Timestamp : {new Date(parseInt(tx.inBound.timeStamp) * 1000).toLocaleString()}
                                        </Typography>

                                        {tx.Status === "true" ?
                                            <Typography gutterBottom className="title" component="div" style={{ fontWeight: '600' }}>
                                                Is Bridge : {tx.inBound.Status}
                                            </Typography>
                                            :
                                            <div></div>
                                        }
                                        <Typography gutterBottom className="title" component="div">
                                            From : {tx.inBound.from}
                                        </Typography>

                                        <Typography gutterBottom className="title" component="div">
                                            To : {tx.inBound.to}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </div>
                    </div>
                )
            })} */}</div></div>
            </main>
        </div>
    );
}

export default Matching;