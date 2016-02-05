//Implemented a module pattern. I am using IIFE for all the modules. We can also create a main module which invokes these as sub modules as well
// I am using pub sub model to communicate between modules


/*This module will have handler for the event which is triggered when search button is clicked. It then fetches the data using FB api and then
publish the data to the searchList module*/

var textBoxModule = (function (windowScope) {


	var accessToken = "112236402217273|W2sfTkrLWBDkQlFrm17BRH-hNUM";

	function onSearchClick() {
		var searchString  = document.getElementById("searchBox").value;

		getSearchResult(searchString, "pagesCall");
	}

	function getSearchResult(str, type) {
		var url = generateURL(str, type);

        windowScope.FB.api(url, function (response) {
			windowScope.events.publish("data-loaded", response);
        }.bind(this));


	}

    /* Returns the URL that needs to be fired for the FB API*/
    function generateURL(param, type) {
        if (type === "pagesCall") {
            return "search?type=page&access_token=" + accessToken + "&q=" + param;
        } else {
            return param;
        }
    }

    // api exposed to the outer world. This is used in the main html for search button

	return  {
		search: onSearchClick
	};


})(this);


/*As we are using IIFE for each module we dont need to expose any public method for this module.  Also introducing in thsi module memory management. Maintaining all the 
event listeners before we load new data*/

var searchList = (function (windowScope) {

	var domNode; // parent dom where all the new data will be loaded. we'll set it after dom is loaded

	function initEventHandler() {
		windowScope.events.subscribe("data-loaded", function (obj) {
			render(obj, true);
		});

		windowScope.events.subscribe("unfav-clicked", function (obj) {
			render(obj, false);
		});
	}

	function render(data, shouldCleanUp) {
		domNode = document.getElementById("searchListBox"); // set the parent dom as it's loaded now

		if (shouldCleanUp) { // clean up memory and dom before rendering new data
			cleanUp();
		}
		data.data.forEach(function (entry) {
			var tableRow,
			nodeName, isFav, tableData;

			tableRow = document.createElement("tr");

            nodeName = document.createElement("a");
            tableRow.setAttribute("id", entry.id);
            nodeName.setAttribute("href", "#");
            nodeName.innerHTML = entry.name;


            tableData = document.createElement("td");
            tableData.classList.add("pageName");
            tableData.appendChild(nodeName);
            tableRow.appendChild(tableData);

            tableData = document.createElement("td");
            tableData.classList.add("pageCatagory");
            tableData.innerHTML = entry.category;
            tableRow.appendChild(tableData);


            isFav = document.createElement("input");
            isFav.setAttribute("data-id", entry.id); // use dataset
            isFav.setAttribute("type", "button");
            isFav.setAttribute("name", "Favourite This");

			isFav.value = "Favourite Page";

			windowScope.attachEventListnerModified.on(isFav, domNode, "click", function () {
					domNode.removeChild(tableRow);
					windowScope.events.publish("fav-clicked", entry);
				}.bind(this));

            tableData = document.createElement("td");
            tableData.classList.add("favouriteButton");
            tableData.appendChild(isFav);
            tableRow.appendChild(tableData);

            domNode.appendChild(tableRow);
		});
	}



	function cleanUp() {
		if (domNode.attachedEvents) {
			removeEventListners();
			domNode.attachedEvents = null;
		}
		domNode.innerHTML = "";
	}


	// remove all evenListners attached to the parent dom
	function removeEventListners() {
		domNode.attachedEvents.forEach(function (listner) {
			listner.dom.removeEventListener(listner.type, listner.callBack);
		});
	}


	initEventHandler(); // intitalizing the subscribe event handlers.
})(this);




/* Another module which tracks the fav pages. Just for the demo purpose i am using closures to set the even listner.
 Better way would be to use the dom attached even approach as in the module above. This is just to show the use of closure*/


var favList = (function (windowScope) {

	var domNode;

	function initEventHandler() {
		windowScope.events.subscribe("fav-clicked", function (nodeData) {
			render(nodeData);
		});
	}

	function render(entry) {

		domNode = document.getElementById("favouriteListBox");
		var tableRow, nodeName, tableData, isFav;

		document.getElementById("_noDataFav").classList.add("hide");


		tableRow = document.createElement("tr");

        nodeName = document.createElement("a");
        nodeName.setAttribute("id", entry.id);
        nodeName.setAttribute("href", "#");
        nodeName.innerHTML = entry.name;


        tableData = document.createElement("td");
        tableData.classList.add("pageName");
        tableData.appendChild(nodeName);
        tableRow.appendChild(tableData);

        tableData = document.createElement("td");
        tableData.classList.add("pageCatagory");
        tableData.innerHTML = entry.category;
        tableRow.appendChild(tableData);

		isFav = document.createElement("input");
        isFav.setAttribute("type", "button");
        isFav.setAttribute("name", "Favourite This");

        isFav.setAttribute("id", entry.id);
		isFav.value = "Unfavourite Page";
        (function (data, tableRow) { // using closures to pass the correct data to the callback
			isFav.addEventListener("click", function () {
				var a = [];
				
				domNode.removeChild(tableRow);
				if (domNode.childElementCount === 1) {
					document.getElementById("_noDataFav").classList.remove("hide");
				}

				a.push(data);
				windowScope.events.publish("unfav-clicked", {data: a});
			}.bind(this));
        })(entry, tableRow);

        tableData = document.createElement("td");
        tableData.classList.add("favouriteButton");
        tableData.appendChild(isFav);
        tableRow.appendChild(tableData);


        domNode.appendChild(tableRow);


	}

	initEventHandler();
})(this);