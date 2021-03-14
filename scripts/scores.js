var minScore;
var maxScore;

var name;
var email;
var country;
var score;



$(function() {
	updateScores();
	$.getJSON('scripts/scores.json', function(data) {
		var tr;
		for (var i = 1; i < data.length; i++) {
			tr = $('<tr>');
			tr.append('<td>' + data[i]['Name'] + '</td>');
			tr.append('<td>' + data[i]['Email'] + '</td>');
			tr.append('<td>' + data[i]['Country'] + '</td>');
			tr.append('<td>' + data[i]['Score'] + '</td></tr>');
			$('#scoresTable').append(tr);
		}
	});
});

function updateScores() {
	$.getJSON('scripts/scores.json', function(data) {
		minScore = data[0]['MinScore'];
		maxScore = data[0]['MaxScore'];
		for (var i = 1; i < data.length; i++) {
			var iScore = data[i]['Score'];
			if (iScore >= maxScore) {
				maxScore = iScore;
				data[0]['MaxScore'] = iScore;
				console.log("New MaxScore: " + maxScore);
			}
			if (iScore <= minScore) {
				minScore = iScore;
				data[0]['MinScore'] = iScore;
				console.log("New MinScore: " + minScore);
			}
		}
		console.log("Max, min: " + maxScore + ", " + minScore);
	});
}

function setScore(Name, Email, Country, Score, position) {
	$.getJSON('scripts/scores.json', function(data) {
		data[position]['Name'] = Name;
		data[position]['Email'] = Email;
		data[position]['Country'] = Country;
		data[position]['Score'] = Score;
	});
	console.log("Added: " + Name + " - " + Email + " - " + Country + " - " + Score);
	updateScores();
}

function showResults() {
	document.getElementById("looseContainer").style.display = "inline";
	document.getElementById("scoreDisplay").textContent = "Your score is: " + score;
}
	
function askForInfo() {
	document.getElementById("inputContainer").style.display = "inline";
	document.getElementById("scoreShow").textContent += score;
	// User should press send --> sendInfo
}

function addPlayer(Country, Score) {
	updateScores();
	country = Country;
	score = Score;
	if (Score < minScore) {
		showResults();
		console.log("Did not add player");
	} else {
		askForInfo();
	}
	restartGame();
	return;
}

function sendInfo() {
	updateScores();
	var Name = document.getElementById("nameField").value;
	var Email = document.getElementById("mailField").value;
	/*while ((Name == "") || (Email == "")) {
		document.getElementById("sendButton").disabled = true;
		await new Promise(r => setTimeout(r, 500));
	}*/
	if (Name == "") {
		document.getElementById("scoreShow").textContent = "Please fill in at least your name.";
		return;
	}
	name = Name;
	email = Email;
	document.getElementById("sendButton").disabled = false;
	document.getElementById("inputContainer").style.display = "none";
	$.getJSON('scripts/scores.json', function(data) {
		if (score > maxScore) {
			alert("Congrats! You have beaten the record of " + maxScore + "!");
		}
		if (data.length == 11) {
			for (var i = 1; i < data.length; i++) {
				if (data[i]['Score'] == minScore) {
					alert("You kicked " + data[i]['Name'] + " out of the leaderboard!");
					console.log("Kicked someone");
					setScore(name, email, country, score, i);
					break;
				}
			}
		} else {
			setScore(name, email, country, score, data.length);
		}
	});
}

function validToPlay() {
	var cond1 = document.getElementById("inputContainer").style.display == "none";
	if (cond1) {
		return true;
	}
	return false;
}