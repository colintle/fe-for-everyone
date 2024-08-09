import React, {useContext} from 'react'

import { MyContext } from '../MyProvider'
import EmptyPage from "./EmptyPage"
import Multi from './multi/Multi'
import Single from './Single/Single'

function Code() {
    const {single, multi} = useContext(MyContext)

    if (single) {
        return (
          <Single problem={single.exam}/>
        )
      }
    else if (multi) {
        return (
            <Multi problem={multi.exam}/>
        )
    }
    else {
        return (
            <EmptyPage/>
        )
    }

}

export default Code