import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { MyContext } from '../MyProvider';
import Multi from './multi/Multi';
import Single from './single/Single';
import Loading from './Loading';

function Code() {
    const { single, multi, completedProblems } = useContext(MyContext);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer); 
    }, []);

    useEffect(() => {
        if (!single && !multi && !loading) {
            navigate("/");
        }
    }, [single, multi, loading, navigate]);

    const isCompleted = (examName) => {
        return completedProblems.some(problem => problem.problemStatementPath === examName);
    };

    if (loading) {
        return <Loading />;
    } else if (single) {
        const completed = isCompleted(single.exam);
        return <Single problem={single.exam} completed={completed} />;
    } else if (multi) {
        const completed = isCompleted(multi.exam);
        // will need to fetch the room data from api
        return <Multi problem={multi.exam} completed={completed} inviteCode={"example"} />;
    } else {
        return null; // Or any other fallback UI
    }
}

export default Code;
