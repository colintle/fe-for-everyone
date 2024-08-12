import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { MyContext } from '../MyProvider';
import Multi from './multi/Multi';
import Single from './Single/Single';
import Loading from './Loading';

function Code() {
    const {single, multi } = useContext(MyContext);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()

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
        navigate("/")
    }
}

export default Code;
