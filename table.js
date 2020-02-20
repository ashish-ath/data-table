function DataTable(columns = [], list = [], container, options) {
    const _options = options || {};
    const sortOrderMap = {
        'asc': 'dsc',
        'dsc': 'asc'
    }

    this.pageSize = _options.pageSize || '';
    this.pageNo = _options.pageNo || '';
    this.paginatorWindow = [1, 5];
    this.sortDetails = {
        col: '',
        sort: 'asc'
    };
    this.filterDetails = {
        col: '',
        searchKey: ''
    };


    if(columns.length < 1 || list.length < 1 || !container){
        throw('Error! Unable to initialize table. Check if column data and list data is passed');
    }

    this.data = [...list];

    if(this.pageSize){
        this.chunkedData = _chunkData(this.data, this.pageSize);
        this.pageNo = 0;

        this.data = this.chunkedData[this.pageNo];
    }

    function _chunkData(dataList = [], size){
        const chunkedArr = [];
        let tempArr = [];

        for(let i = 0; i < dataList.length; i++){
            tempArr.push(dataList[i]);

            if(tempArr.length === size){
                chunkedArr.push(tempArr);
                tempArr = [];
            }
        }

        return chunkedArr;
    }


    function _renderTableRow(obj){
        return columns.map(col => `<td>${obj[col.value]}</td>`).join('');
    };

    _renderSearchFilter = (columnData) => {
        let renderData = '';
        const filterDetails = this.filterDetails;

        if(columnData.searchable){
            renderData = (
                `<input 
                    class="search"  
                    data-col="${columnData.value}" 
                    placeholder=" Search by ${columnData.label}"
                    value="${filterDetails.col === columnData.value && filterDetails.searchKey || ''}"
                />`
            );
        } 

        return '<td>' + renderData + '</td>';
    };

    _renderTableHeaderCell = (columnData) => {
        let renderData = '';
        const sortDetails = this.sortDetails;

        if(columnData.sortable){
            renderData = (
                `<div>
                    ${columnData.label} &nbsp;&nbsp;
                    <span class="sort" data-col="${columnData.value}"> 
                        ${sortDetails.col === columnData.value && getSortIcon(sortDetails.sort) || '&#x2195'} 
                    </span>
                </div>`
            );
        } else {
            renderData = (
                `<div>${columnData.label}</div>`
            );
        }
        return '<th>' + renderData + '</th>';
    }

    function getSortIcon(order) {
        const desc = '&#x2193;';
        const asc = '&#x2191;';

        if(order === 'asc'){
            return asc;
        } else {
            return desc;
        }      
    }

    render = () => { //ToDo: Optimize render by changing only table body
        const searchFilters = getSearchFilters();
        const tableHeaderCells = getTableHeaders();
        const tableRows = getTableRows();

        return (
            `<div>
                <table>
                    <thead>
                        <tr>${searchFilters}</tr>  
                        <tr>${tableHeaderCells}</tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                <div class='paginator'> 
                    <div class="previous-page page-nav">
                       < Previous
                    </div>
                    <div>
                        ${getPaginator()}
                    </div>
                    <div class="next-page page-nav">
                        Next >
                    </div>
                </div>
            </div>`
        );
    };

    getSearchFilters = () => columns.map(col => _renderSearchFilter(col)).join('');

    getTableHeaders = () => columns.map(col => _renderTableHeaderCell(col)).join('');

    getTableRows = () => this.data.map(item => `<tr>${_renderTableRow(item)}</tr>`).join('');

    getPaginator = () => {
        let noOfPages;
        let renderData = '';
        let currentPageNo = this.pageNo + 1;

        if(this.chunkedData){
            noOfPages = this.chunkedData.length

            if(currentPageNo >= this.paginatorWindow[1] || currentPageNo <= this.paginatorWindow[0]){
                this.paginatorWindow[0] = currentPageNo;
                this.paginatorWindow[1] = currentPageNo + 5 < this.chunkedData.length ? currentPageNo + 5 : currentPageNo + (this.chunkedData.length - currentPageNo);
            }
            for(let i = this.paginatorWindow[0]; i <= this.paginatorWindow[1]; i ++){
                renderData += (`
                    <span class="page-no ${currentPageNo === i ? 'curr-page' : ''}" data-pageno="${i}">${i}</span>
                `);
            }


            renderData += '<span> . . . .</span>';
            renderData += `<span class="page-no" data-pageno="${noOfPages}">${noOfPages}</span>`
        }

        return renderData;
    }

    _updateDom = () => {
        const renderContent = render();
        container.innerHTML = renderContent;

        _addEvents();
    }

    _addEvents = () => {
        const sortableCols = document.getElementsByClassName('sort');
        const filterCols = document.getElementsByClassName('search');
        const pageNavs = document.getElementsByClassName('page-nav');
        const pageNos = document.getElementsByClassName('page-no');
        
        attachEvents('click', sortableCols, _sortListener);
        attachEvents('keyup', filterCols, _searchListener);
        attachEvents('click', pageNavs, pageNavHandler);
        attachEvents('click', pageNos, pageNoClickHandler);
    }

    attachEvents = (eventType, domNodes, handler) => {
        for(let index = 0; index < domNodes.length; index++){
            domNodes[index].addEventListener(eventType, handler);
        }
    }

    _sortListener = (e) => {
        const colName = e.target.dataset.col;

        _sort(colName);
    };

    _searchListener = (e) => {
        const searchKey = e.target.value;
        const colName = e.target.dataset.col;

        if(e.which === 13){
            _filterBySearchKey.call(this, searchKey, colName);
        }
    }

    pageNavHandler = (e) => {
        if(e.target.classList.contains('previous-page')){
            this.pageNo = this.pageNo > 0 ? this.pageNo - 1 : this.pageNo;
        } else {
            this.pageNo = this.pageNo < this.chunkedData.length ? this.pageNo + 1 : this.pageNo;
        }

        setPageData();
    };

    pageNoClickHandler = (e) => {
        const pageNo = e.target.dataset.pageno;

        this.pageNo = Number(pageNo) - 1;
        setPageData();
    }    

    setPageData = () => {
        this.data = this.chunkedData[this.pageNo];

        _updateDom();
    };

    function _filterBySearchKey(searchKey, colName){
        let filteredArr = [];
        const filterData = this.filterDetails;

        if(filterData.col !== colName){
            this.data = this.chunkedData[this.pageNo];

        }

        const listData = [...this.data];
        
        this.filterDetails.col = colName;
        this.filterDetails.searchKey = searchKey;

        if(searchKey){
            filteredArr = listData.filter(data => (
                data[colName].toLowerCase().indexOf(searchKey.toLowerCase()) > -1)
            );
            this.data = filteredArr;
        } else {
            this.data = this.chunkedData[this.pageNo];
        }

        _updateDom();
    };  

    _sort = (colName) => {
        const listData = [...this.data];

        if(this.sortDetails.col === colName){ //already a sorted column?
            this.sortDetails.sort = sortOrderMap[this.sortDetails.sort]; 
        } else { //New column sort
            this.sortDetails.col = colName;
            this.sortDetails.sort = 'asc';
        }

        listData.sort((a, b) => {
            if(this.sortDetails.sort === 'asc'){
                if (a[colName] < b[colName])
                return -1;
                if ( a[colName] > b[colName])
                return 1;
                return 0;
            } else {
                if (a[colName] < b[colName])
                return 1;
                if ( a[colName] > b[colName])
                return -1;
                return 0;
            }
        });

        this.data = listData;
        _updateDom();
    }

    _updateDom();
};