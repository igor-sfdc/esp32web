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

    function paddedValue(map, key, numPositions) {
        // Default to 4 positions
        if (numPositions === undefined) {
            numPositions = 4;
        }
        var value = Number(map[key]);
        return value.pad(numPositions);
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

        var commandPath = "/11__"; // Expected 11 commands total
        
        commandPath += "red-" + paddedValue(retrieved, "redCurrent");
        commandPath += paddedValue(retrieved, "redBias1");
        commandPath += paddedValue(retrieved, "redBias2");
        commandPath += paddedValue(retrieved, "redBias3");
        commandPath += paddedValue(retrieved, "redBias4");

        commandPath += "~";
        commandPath += "green-" + paddedValue(retrieved, "greenCurrent");
        commandPath += paddedValue(retrieved, "greenBias1");
        commandPath += paddedValue(retrieved, "greenBias2");
        commandPath += paddedValue(retrieved, "greenBias3");
        commandPath += paddedValue(retrieved, "greenBias4");

        commandPath += "~";
        commandPath += "blue-" + paddedValue(retrieved, "blueCurrent");
        commandPath += paddedValue(retrieved, "blueBias1");
        commandPath += paddedValue(retrieved, "blueBias2");
        commandPath += paddedValue(retrieved, "blueBias3");
        commandPath += paddedValue(retrieved, "blueBias4");

        commandPath += "~";
        commandPath += "gain-" + paddedValue(retrieved, "gainCh1");
        commandPath += paddedValue(retrieved, "gainCh2");
        commandPath += paddedValue(retrieved, "gainCh3");
        commandPath += paddedValue(retrieved, "gainCh4");

        commandPath += "~";
        commandPath += "timerUs-" + paddedValue(retrieved, "timerUs");

        commandPath += "~";
        commandPath += "averageOverReadings-" + paddedValue(retrieved, "averageOverReadings", 2);
        commandPath += "~";
        commandPath += "ledMgmtDelayUs-" + paddedValue(retrieved, "ledMgmtDelayUs");
        commandPath += "~";
        var explorerServerIP = retrieved["explorerServerIP"].trim();
        var ipregex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
        var isValidIPPattern = explorerServerIP.match(ipregex).length === 1;
        if (explorerServerIP === "0.0.0.0" || !isValidIPPattern) {
            alert("Incorrect Explorer Server Address '" + explorerServerIP + "'.\n\nCheck your PC IP address and try again.\n\nExamples of a valid IP address:\n 10.0.0.18\n 192.168.1.8");
            return false;
        }
        commandPath += "explorerServerIP-" + explorerServerIP;

        commandPath += "~";
        commandPath += retrieved["resumeSuspend"] === "on" ? "resume" : "suspend";

        commandPath += "~";
        commandPath += "autoAdjust-";
        commandPath += retrieved["autoAdjust"] === "on" ? "1" : "0";

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

        clickCommandLink(commandPath);

        return false;
    }

    function clickCommandLink(commandPath) {
        var commandLink = document.getElementById("commandLink");

        var esp32ServerIP = getEsp32ServerIP();
        var protocol = esp32ServerIP.startsWith("http") ? "" : "http://";
        commandLink.href = protocol + esp32ServerIP + commandPath;

        commandLink.click();
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

    // Update data displayed on the page to reflect auto-adjustment changes from device
    function syncWithDevice() {
        console.log("updating form using device data");
        var deviceState = document.getElementById("deviceState");
        var searchParamsStr = deviceState ? deviceState.innerText : "";
        var searchParams = new URL("http://host.com" + searchParamsStr).searchParams;
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

    // Simply "touch" the device URL to bring in current device settings without running any commands
    function loadDataFromDevice() {
        var commandPath = "/0__"; // Expected 0 commands total
        clickCommandLink(commandPath);
        return false;
    }

    function loadData() {
        var savedEntriesString = localStorage.getItem("savedEntries");
        if (!savedEntriesString) {
            console.log("no saved data found");
            // This will initialize server address to origin
            getEsp32ServerIP();
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

        // This will override the data saved in the browser with the data saved in the device
        var autosync = document.getElementById("autosync");
        console.log("autosync enabled loading data from the device: " + autosync.checked);
        if (autosync && autosync.checked) {
            syncWithDevice();
        }
        
        // This will initialize server address to origin if necessary
        getEsp32ServerIP();

        onResumeSuspendChange(null);
    }

    function getEsp32ServerIP() {
        var esp32ServerIPElement = document.getElementById("esp32ServerIP");
        var esp32ServerIP = esp32ServerIPElement.value.trim();
        if(esp32ServerIP.length == 0 || esp32ServerIP.startsWith("0.")) {
            esp32ServerIPElement.value = window.location.origin;
            return esp32ServerIPElement.value;
        } else {
            return esp32ServerIP;
        }
    }
