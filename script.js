    //window.addEventListener('DOMContentLoaded', function(){
    //    loadData();
    //});

    function updateValue(control) {
        var valueId = "valueOf-" + control.name;
        var valueOutput = document.getElementById(valueId);
        if (valueOutput) {
            valueOutput.value = control.value;
        }
    }

    // https://stackoverflow.com/a/11187738
    Number.prototype.pad = function(size) {
        var s = String(this);
        while (s.length < (size || 2)) {s = "0" + s;}
        return s;
    }

    function paddedValue(map, key) {
        var value = Number(map[key]);
        return value.pad(4);
    }

    function onFormSubmit(form) {
        console.log("form submit");
        var data = new FormData(form);
        var entries = data.entries();
        var formEntry = entries.next();
        var retrieved = {};
        while(undefined !== formEntry.value) {
            retrieved[formEntry.value[0]] = formEntry.value[1];
            formEntry = entries.next();
        }
        //console.log('retrieved: ', retrieved);

        var autosave = document.getElementById("autosave");
        console.log("autosave enabled: " + autosave.checked);
        if (autosave && autosave.checked) {
            saveData();
        }

        var commandPath = "/0__";
        commandPath += "red-" + paddedValue(retrieved, "redCurrent");
        commandPath += paddedValue(retrieved, "redBias1");
        commandPath += paddedValue(retrieved, "redBias2");

        commandPath += "~";
        commandPath += "green-" + paddedValue(retrieved, "greenCurrent");
        commandPath += paddedValue(retrieved, "greenBias1");
        commandPath += paddedValue(retrieved, "greenBias2");

        commandPath += "~";
        commandPath += "blue-" + paddedValue(retrieved, "blueCurrent");
        commandPath += paddedValue(retrieved, "blueBias1");
        commandPath += paddedValue(retrieved, "blueBias2");

        commandPath += "~";
        commandPath += "gain-" + paddedValue(retrieved, "gainCh1");
        commandPath += paddedValue(retrieved, "gainCh2");
        commandPath += paddedValue(retrieved, "gainCh3");
        commandPath += paddedValue(retrieved, "gainCh4");

        commandPath += "~";
        commandPath += retrieved["resumeSuspend"] === "on" ? "resume" : "suspend";

        if (retrieved["redOn"] === "on") {
            commandPath += "~";
            commandPath += "redOn";
            commandPath += "~";
            commandPath += "greenOff";
            commandPath += "~";
            commandPath += "blueOff";
        } else if (retrieved["greenOn"] === "on") {
            commandPath += "~";
            commandPath += "greenOn";
            commandPath += "~";
            commandPath += "redOff";
            commandPath += "~";
            commandPath += "blueOff";
        } else if (retrieved["blueOn"] === "on") {
            commandPath += "~";
            commandPath += "blueOn";
            commandPath += "~";
            commandPath += "redOff";
            commandPath += "~";
            commandPath += "greenOff";
        } else if (retrieved["allOn"] === "on") {
            commandPath += "~";
            commandPath += "allOn";
        } else {
            commandPath += "~";
            commandPath += "allOff";
         }

        var commandLink = document.getElementById("commandLink");

        var serverAddress = getServerAddress();
        var protocol = serverAddress.startsWith("http") ? "" : "http://";
        commandLink.href = protocol + serverAddress + commandPath;

        commandLink.click();

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

    function onResumeSuspendChange(slider) {
        if (!slider) {
            slider = document.getElementById("resumeSuspend");
        }
        
        var label = document.getElementById("resumeSuspendLabel");
        if (slider.checked) {
            label.innerHTML = "Suspend";
        } else {        
            label.innerHTML = "Resume";
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

    function syncWithDevice() {
        console.log("updating form using device data");
        var searchParams = new URL(window.location).searchParams
        var form = document.getElementById("inputForm");
        var elements = form.elements;

        var numElements = elements.length;
        for (idx=0; idx < numElements; idx++) {
            var element = elements[idx];
            var name = element.name;
            if(name) {
                var value = searchParams.get(name)
                if (value) {
                    console.log("loaded device value: " + value + " for for field: " + name);
                    if(element.type === "checkbox") {
                        element.checked = value === "on";
                    } else {
                        element.value = value;
                        updateValue(element);
                    }
                }
            }
        }
    }

    function loadData() {
        var savedEntriesString = localStorage.getItem("savedEntries");
        if (!savedEntriesString) {
            console.log("no saved data found");
            return;
        }

        console.log("loading saved data");
        var savedEntries = JSON.parse(savedEntriesString);       
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
                        updateValue(element);
                    }
                }
            }
        }

        // This will initialize server address to origin if necessary
        getServerAddress();

        onResumeSuspendChange(null);
    }

    function getServerAddress() {
        var serverAddressElement = document.getElementById("serverAddress");
        var serverAddress = serverAddressElement.value.trim();
        if(serverAddress.length == 0 || serverAddress.startsWith("0.")) {
            serverAddressElement.value = window.location.origin;
            return serverAddressElement.value;
        } else {
            return serverAddress;
        }
    }
