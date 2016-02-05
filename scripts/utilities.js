// This file includes the utility funtions we will be using in main js. 



// We keep track of all the even listeners on the dom itself so we can clear all the eventlisters later
var attachEventListnerModified = (function () {

	return {
		on : function (dom, parentDom, eventType, callBack) {
			if (!parentDom.attachedEvents) {
				parentDom.attachedEvents = [];
			}

			parentDom.attachedEvents.push({dom: dom, type: eventType, callBack: callBack});

			dom.addEventListener(eventType, callBack);
		}
	};
})();



// THis is the pub sub module where we expose the necessary functions

var events = (function () {
    var topics = {},
    hOP = topics.hasOwnProperty;

    return {
        subscribe: function (topic, listener) {
            // Create the topic's object if not yet created
            if (!hOP.call(topics, topic)) {
				topics[topic] = [];
            }

            // Add the listener to queue
            var index = topics[topic].push(listener) - 1;

            // Provide handle back for removal of topic
            return {
                remove: function () {
                    delete topics[topic][index];
                }
            };
        },
        publish: function (topic, info) {
            // If the topic doesn't exist, or there's no listeners in queue, just leave
            if (!hOP.call(topics, topic)) {
				return;
            }

            // Cycle through topics queue, fire!
            topics[topic].forEach(function (item) {
                item(info !== undefined ? info : {});
            });
        }
    };
})();
