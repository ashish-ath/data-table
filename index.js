(function() {

    const fetchData = function(){
        return fetch('https://restcountries.eu/rest/v2/all')
            .then(res => res.json());
    }

    const buildTable = function(data = []){
        const tableContainer = document.getElementById('container');
        const columns = [
            {
                value: 'name',
                label: 'Name',
                sortable: true,
                searchable: true
            },
            {
                value: 'capital',
                label: 'Capital',
                sortable: true
            },
            {
                value: 'region',
                label: 'Region',
                sortable: true,
                searchable: true
            },
            {
                value: 'population',
                label: 'Population',
                sortable: true
            },
            {
                value: 'nativeName',
                label: 'Native Name',
            }
        ];

        new DataTable(columns, data, tableContainer, {pageSize: 10});
    }

    const processResponse = function(data = []){
        return data.map(item => (
            {
                name: item.name,
                capital: item.capital,
                region: item.region,
                population: item.population,
                nativeName: item.nativeName
            }
        ));
    }

    fetchData().then(res => {
        const processedRes = processResponse(res);

        buildTable(processedRes);
    });
    
})();