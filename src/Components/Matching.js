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
            <Link className='btn btn-success' to='/'> Back</Link>
            {dataList.map((distanceObj, i) => {
                console.log(distanceObj.outboundTxn.hash);
                return (
                    <div>
                        <Card key={distanceObj.outboundTxn.hash} sx={{ maxWidth: 400 }} className="card-margin">
                            <CardActionArea>
                                <CardContent>
                                    <Typography gutterBottom className="title" component="div">
                                        Transaction Hash : {distanceObj.outboundTxn.hash}
                                    </Typography>

                                    <Typography gutterBottom className="title" component="div">
                                        Block Number : {distanceObj.outboundTxn.blockNumber}
                                    </Typography>

                                    <Typography gutterBottom className="title" component="div">
                                        Amount : {distanceObj.outboundTxn.value}
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
                                        From : {distanceObj.outboundTxn.from}
                                    </Typography>

                                    <Typography gutterBottom className="title" component="div">
                                        To : {distanceObj.outboundTxn.to}
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
                                            <Card key={inTxn.inboundTxn.hash} sx={{ maxWidth: 400 }} className="card-margin">
                                                <CardActionArea>
                                                    <CardContent>
                                                        <Typography gutterBottom className="title" component="div">
                                                            Transaction Hash : {inTxn.inboundTxn.hash}
                                                        </Typography>

                                                        <Typography gutterBottom className="title" component="div">
                                                            Block Number : {inTxn.inboundTxn.blockNumber}
                                                        </Typography>

                                                        <Typography gutterBottom className="title" component="div">
                                                            Amount : {inTxn.inboundTxn.value}
                                                        </Typography>

                                                        <Typography gutterBottom className="title" component="div">
                                                            Timestamp : {new Date(parseInt(inTxn.inboundTxn.timeStamp) * 1000).toLocaleString()}
                                                        </Typography>

                                                        {inTxn.inboundTxn.Status === "true" ?
                                                            <Typography gutterBottom className="title" component="div" style={{ fontWeight: '600' }}>
                                                                Is Bridge : {inTxn.inboundTxn.Status}
                                                            </Typography>
                                                            :
                                                            <div></div>
                                                        }
                                                        <Typography gutterBottom className="title" component="div">
                                                            From : {inTxn.inboundTxn.from}
                                                        </Typography>

                                                        <Typography gutterBottom className="title" component="div">
                                                            To : {inTxn.inboundTxn.to}
                                                        </Typography>

                                                        <Typography gutterBottom className="title" component="div">
                                                            Distance : {inTxn.distance}
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
            })} */}
        </div>
    );
}

export default Matching;