import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react'

const MissionTimer = forwardRef((props, ref) => {
    const [date, setDate] = useState("Aug 20, 1977")
    const [event, setEvent] = useState("Launch")

    useImperativeHandle(ref, () => ({
        setDate: (d) => setDate(d),
        setEvent: (e) => setEvent(e)
    }))

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
            <div className="text-4xl font-mono text-cyan-400 font-bold drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                {date}
            </div>
            <div className={`mt-2 text-xl text-yellow-300 font-bold uppercase tracking-widest transition-opacity duration-500 ${event ? 'opacity-100' : 'opacity-0'}`}>
                {event}
            </div>
            <div className="mt-1 text-xs text-slate-400">
                Voyager 2 Mission Clock
            </div>
        </div>
    )
})

export default MissionTimer
