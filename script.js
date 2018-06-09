    //window.addEventListener('DOMContentLoaded', function(){
    //    loadData();
    //});
     
    function updateValue(control) {
        var valueId = "valueOf-" + control.name;
        var valueOutput = document.getElementById(valueId);
        valueOutput.value = control.value;
    }
    
    function onFormSubmit(form) {
/*
        console.log("form submit");
        var data = new FormData(form);
        var entries = data.entries();              
        var formEntry = entries.next();
        var retrieved = {};             
        while(undefined !== formEntry.value) {    
            retrieved[formEntry.value[0]] = formEntry.value[1];
            formEntry = entries.next();
        }
        console.log('retrieved: ', retrieved);
*/
		var autosave = document.getElementById("autosave");
        console.log("autosave enabled: " + autosave.checked);
		if (autosave && autosave.checked) {
        	saveData();
        }
        
        var serverAddress = document.getElementById("serverAddress");
        if(!serverAddress || 
        	serverAddress.value.trim().length == 0 ||
            serverAddress.value.trim().startsWith("0.")) {
        		alert("Invalid or empty server address: '" + serverAddress.value + "'");
        }
        return false;
    }
    
    function onSliderChange(slider) {
    	var sliders = document.getElementsByClassName("switch-checkbox");

        for (otherSlider of sliders) {
        	if(slider !== otherSlider) {
            	otherSlider.checked = false;
            }
        }
    }
    
    function saveData() {
		var form = document.getElementById("inputForm");

        var data = new FormData(form);
        var entries = data.entries();              
        var formEntry = entries.next();
        var savedEntries = {};             
        while(undefined !== formEntry.value) {    
            savedEntries[formEntry.value[0]] = formEntry.value[1];
            formEntry = entries.next();
        }
        localStorage.setItem("savedEntries", JSON.stringify(savedEntries));
        console.log('savedEntries: ', savedEntries);
    }
    
    function loadData() {
        var savedEntriesString = localStorage.getItem("savedEntries");
        if (!savedEntriesString) {
    		console.log("no saved data found");
        	return;
        }
        
    	console.log("loading saved data");
		var savedEntries = JSON.parse(savedEntriesString);

/*
		for (var key in savedEntries) {
			var value = savedEntries[key];
			console.log(key, value);
		}
*/        
        var form = document.getElementById("inputForm");
        var elements = form.elements;
        
        var numElements = elements.length;
        for (idx=0; idx < numElements; idx++) {
        	var element = elements[idx];
			var name = element.name;
			if(name) {
                var value = savedEntries[name];
                if (value) {
    				console.log("loaded saved value: " + value + " for for field: " + name);
                    if(element.type === "checkbox") {
                    	element.checked = value === "on";
                    } else {
                    	element.value = value;
                    }
                }
            }
	}
    }
