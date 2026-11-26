import { useEffect, useState } from "react";

function Clock(){
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateClock = () => {
            const date = new Date();
            const pad = (n) => (n < 10 ? "0" + n : n);
            setTime(`${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`);
        };
    updateClock(); 
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
    }, []);

    return <span id="DisplayClock" className="clock">{time}</span>;
}

export default Clock;