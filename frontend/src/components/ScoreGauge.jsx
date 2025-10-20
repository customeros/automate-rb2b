import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

function ScoreGauge({ score, tier }) {
    const data = [{ value: score }, { value: 100 - score }];

    const getColor = (tier) => {
        switch (tier) {
            case "A":
                return "#10b981"; // green
            case "B":
                return "#3b82f6"; // blue
            case "C":
                return "#f59e0b"; // yellow
            case "D":
                return "#ef4444"; // red
            default:
                return "#6b7280"; // gray
        }
    };

    const color = getColor(tier);

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={40}
                            outerRadius={60}
                            dataKey="value"
                        >
                            <Cell fill={color} />
                            <Cell fill="#e5e7eb" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color }}>
                            {tier}
                        </div>
                        <div className="text-xs text-gray-500">{score}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ScoreGauge;

