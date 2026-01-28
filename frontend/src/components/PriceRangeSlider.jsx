import React, { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";

export default function PriceRangeSlider({
    jobs = [],
    initialStep = 10000,
    className = "",
    onPivotChange,
}) {
    const { minSalary, maxSalary } = useMemo(() => {
        if (!jobs || jobs.length === 0)
            return { minSalary: 0, maxSalary: 100000 };

        const salaries = jobs
            .map((j) => {
                if (typeof j.salary === "object" && j.salary?.min) {
                    return Number(j.salary.min);
                }
                if (typeof j.salary === "number") {
                    return j.salary;
                }

                // Try to parse string salary like "10k-20k" or "$50,000"
                const str = String(j.salary);
                // Remove non-numeric chars except . and - (though simple match(\d+) is safer for min)
                const match = str.match(/(\d+)/);
                return match ? Number(match[1]) : NaN;
            })
            .filter((s) => Number.isFinite(s));

        if (salaries.length === 0) return { minSalary: 0, maxSalary: 100000 };

        return {
            minSalary: Math.min(...salaries),
            maxSalary: Math.max(...salaries),
        };
    }, [jobs]);

    const step = Math.max(1, Number(initialStep || 10000));

    // Initialize pivot to maxSalary
    const [pivot, setPivot] = useState(maxSalary);

    // Update pivot when maxSalary changes (e.g. jobs loaded)
    useEffect(() => {
        setPivot(maxSalary);
    }, [maxSalary]);

    const handleChange = (e) => {
        const val = Number(e.target.value);
        setPivot(val);
        if (onPivotChange) {
            onPivotChange(val);
        }
    };

    if (!jobs || jobs.length === 0) return null;

    return (
        <div className={`w-full p-4 ${className}`}>
            <div className="flex justify-between mb-2 text-sm font-medium text-gray-700">
                <span>Min: {minSalary.toLocaleString()}</span>
                <span>Max: {pivot.toLocaleString()}</span>
            </div>
            <input
                type="range"
                min={minSalary}
                max={maxSalary}
                step={step}
                value={pivot}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
        </div>
    );
}

PriceRangeSlider.propTypes = {
    jobs: PropTypes.array,
    initialStep: PropTypes.number,
    className: PropTypes.string,
    onPivotChange: PropTypes.func,
};