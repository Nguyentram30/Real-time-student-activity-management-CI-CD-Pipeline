import { useEffect, useState } from "react";

const Timer: React.FC = () => {
  const [time, setTime] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime({
        days: String(now.getDate()).padStart(2, "0"),
        hours: String(now.getHours()).padStart(2, "0"),
        minutes: String(now.getMinutes()).padStart(2, "0"),
        seconds: String(now.getSeconds()).padStart(2, "0"),
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center gap-6 mt-6">
      {[
        { label: "Days", value: time.days },
        { label: "Hour", value: time.hours },
        { label: "Minute", value: time.minutes },
        { label: "Second", value: time.seconds },
      ].map((item, i) => (
        <div
          key={i}
          className="bg-blue-800 px-8 py-6 rounded-xl backdrop-blur-md border border-white/10"
        >
          <div className="text-3xl font-bold text-cyan-200 text-center">
            {item.value}
          </div>
          <div className="text-sm text-center">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default Timer;
