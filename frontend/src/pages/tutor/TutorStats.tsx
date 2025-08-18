import React from 'react';

interface Stat {
    title: string;
    value: string;
    change: string;
    icon: React.ComponentType<any>;
    color: string;
}

interface TutorStatsProps {
    stats: Stat[];
}

const TutorStats: React.FC<TutorStatsProps> = ({ stats }) => {
    return (
        <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                            <p className="text-sm text-green-600 mt-1">{stat.change} this month</p>
                        </div>
                        <div className={`p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                            <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
export default TutorStats;