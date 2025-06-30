import PropTypes from 'prop-types';

// PropTypes validation
FilterNode.propTypes = {
    data: PropTypes.shape({
        filterMitra: PropTypes.string.isRequired, 
        setFilterMitra: PropTypes.func.isRequired, 
        filterRegional: PropTypes.string.isRequired, 
        setFilterRegional: PropTypes.func.isRequired
    }),
};

function FilterNode({ data }) {
    const { filterMitra, setFilterMitra, filterRegional, setFilterRegional, filterPrioritas, setFilterPrioritas } = data || {};

return (
    <div className="nodrag cursor-default text-center text-white bg-orange-400 p-4 rounded-lg shadow-md flex flex-col gap-2.5 w-[350px]">
        <div className="flex flex-col mb-4 h-fit">
            <label className="text-xl font-semibold mb-2.5" htmlFor="type">Mitra: </label>
            <select className="p-3 text-lg border border-gray-300 rounded-lg hover:border-red-500 focus:border-red-500 duration-300 ease-in-out" id="type" value={filterMitra || ""} onChange={(event) => setFilterMitra(event.target.value)}>
                <option className="text-black" value="" disabled hidden>Select an option</option>
                <option className="text-black" value="Huawei">Huawei</option>
            </select>
            <button className="duration-300 ease-in bg-rose-500 hover:bg-rose-600 reset-btn mt-3" onClick={() => setFilterMitra("")}>Reset</button>
        </div>

        <div className="flex flex-col mb-4 h-fit">
            <label className="text-xl font-semibold mb-2.5" htmlFor="region">Region: </label>
            <select className="p-3 text-lg border border-gray-300 rounded-lg peer hover:border-red-500 focus:border-red-500 duration-300 ease-in-out" id="region" value={filterRegional || ""} onChange={(event) => setFilterRegional(event.target.value)}>
                <option className="text-black" value="" disabled hidden>Select an option</option>
                <option className="text-black" value="REG 1">REG 1</option>
                <option className="text-black" value="REG 2">REG 2</option>
                <option className="text-black" value="REG 3">REG 3</option>
                <option className="text-black" value="REG 4">REG 4</option>
                <option className="text-black" value="REG 5">REG 5</option>
            </select>
            <button className="duration-300 ease-in-out bg-rose-500 hover:bg-rose-600 reset-btn mt-3" onClick={() => setFilterRegional("")}>Reset</button>
        </div>

        <div className="flex flex-col mb-4 h-fit">
            <label className="text-xl font-semibold mb-2.5" htmlFor="region">Tipe Prioritas: </label>
            <select className="p-3 text-lg border border-gray-300 rounded-lg peer hover:border-red-500 focus:border-red-500 duration-300 ease-in-out" id="prioritas" value={filterPrioritas || ""} onChange={(event) => setFilterPrioritas(event.target.value)}>
                <option className="text-black" value="" disabled hidden>Select an option</option>
                <option className="text-black" value="P1">P1</option>
                <option className="text-black" value="P2">P2</option>
                <option className="text-black" value="P3">P3</option>
                <option className="text-black" value="P4">P4</option>
            </select>
            <button className="duration-300 ease-in-out bg-rose-500 hover:bg-rose-600 reset-btn mt-3" onClick={() => setFilterPrioritas("")}>Reset</button>
        </div>
    </div>
);
}

export default FilterNode;
