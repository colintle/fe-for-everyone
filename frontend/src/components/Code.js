import React, { useContext, useState, useEffect } from 'react';

import { MyContext } from '../MyProvider';
import EmptyPage from "./EmptyPage";
import Multi from './multi/Multi';
import Single from './Single/Single';
import Loading from './Loading';

function Code() {
    const {single, multi } = useContext(MyContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer); 
    }, []);

    if (loading) {
        return (
            <Loading/>
        );
    } else if (single) {
        return (
          <Single problem={single.exam}/>
        );
    } else if (multi) {
        return (
            <Multi problem={multi.exam}/>
        );
    } else {
        return (
            <EmptyPage/>
        );
    }
}

export default Code;
