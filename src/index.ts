const WORD_LIST = [
	"banish",
	"brave",
	"front",
	"convulsion",
	"bland",
	"cool",
	"prove",
	"tournament",
	"recovery",
	"copper"
  ];
  
const MESSAGE_CLASS = document.querySelector(".message");
const WIP_CLASS = document.querySelector(".word-in-progress");
const GUESSES_REMAINING_CLASS = document.querySelector(".remaining");
const GUESSED_LETTERS_CLASS = document.querySelector(".guessed-letters");
const GUESS_BTN = document.querySelector("button.guess");
const GUESS_INPUT_CLASS = document.querySelector("input.letter");
const ALREADY_GUESSED_CLASS = document.querySelector(".already-guessed");
const PLAY_AGAIN_BTN = document.querySelector("button.play-again");
const FORM_CONTAINER_CLASS = document.querySelector(".form-container");

let SELECTED_WORD = '';
let GUESSES_LIMIT = 6;

class GuessTheWordGame {
	constructor(name) {
		this.name = name;
		this.selectedWord = SELECTED_WORD;
		this.guessesLimit = GUESSES_LIMIT;
		this.wrongGuesses = [];
		this.correctGuesses = [];
	}

	render() {
		MESSAGE_CLASS.innerHTML = `${this.name}, welcome to Guess the Word`;
		this.selectedWord = this.selectRandomWord();
		this.buildWordHTML();
		this.initialRemainingGuesses()
		this.events();
		this.setInputFocus();
	}

	events() {
		GUESS_BTN.addEventListener("click", this.checkInputGuess.bind(this));
		PLAY_AGAIN_BTN.addEventListener("click", this.startOver.bind(this));
		GUESS_INPUT_CLASS.addEventListener("keypress", this.onGuessInput);
		document.addEventListener("keydown", this.onEnterKey.bind(this));
	}

	checkInputGuess(event) {
		const letter = GUESS_INPUT_CLASS.value;
		if (letter?.length && this.guessesLimit) {
			this.testLetterInWord(letter);
			GUESS_INPUT_CLASS.value = "";
			this.setInputFocus();
		}

	}

	onGuessInput(event) {
		const isValid = /^[a-zA-Z]+$/.test(event.key);

		if (!isValid) {
			event.preventDefault();
			return false;
		}
	}

	onEnterKey(event) {
		const isEnterKey = event.key === "Enter";
		const isGuessInputValid = !!GUESS_INPUT_CLASS.value;
		if (isEnterKey && isGuessInputValid) {
			this.checkInputGuess();
		}
	}

	testLetterInWord(letter) {
		const hasMatch = this.selectedWord.match(letter);
		const allGuesses = [...this.correctGuesses, ...this.wrongGuesses];
		const hasBeenGuessed = !!allGuesses.find(guess => guess.toLowerCase() === letter.toLowerCase());
		if (!hasBeenGuessed) {
			ALREADY_GUESSED_CLASS.classList.add("hide");
			if (hasMatch) {
				this.correctGuesses.push(letter);
				this.updateCorrectLetters();
			} else {
				this.guessesLimit--;
				this.wrongGuesses.push(letter);
				this.updateIncorrectLetters();
			}
		} else {
			ALREADY_GUESSED_CLASS.classList.remove("hide");
		}
		
		this.updateRemainingGuessesMessage();
	}

	updateCorrectLetters() {
		this.correctGuesses.forEach(letter => {
			const letterPosition = this.selectedWord.indexOf(letter);
			const letterElements = WIP_CLASS.children;
			if (letterPosition > -1) {
				letterElements[letterPosition].innerHTML = letter;
				letterElements[letterPosition].classList.remove("invalid-guess");
			}
		})
	}

	updateIncorrectLetters() {
		GUESSED_LETTERS_CLASS.innerHTML = '';
		this.wrongGuesses.forEach(letter => {
			const incorrectLetterElement = document.createElement('span');
			incorrectLetterElement.classList.add("incorrect-letter");
			incorrectLetterElement.textContent = letter;
			GUESSED_LETTERS_CLASS.append(incorrectLetterElement);
		});
	}

	initialRemainingGuesses() {
		this.guessesLimit = this.selectedWord.length + 2;
		this.updateRemainingGuessesMessage();
	}

	updateRemainingGuessesMessage() {
		const guessMessage = this.guessesLimit ? `You have <span class="danger">${this.guessesLimit} incorrect guesses</span> remaining.` : 'Sorry! No soup for you!';
		GUESSES_REMAINING_CLASS.innerHTML = guessMessage;
		this.updateButtonStates();
	}

	updateButtonStates() {
		if (!this.guessesLimit) {
			PLAY_AGAIN_BTN.classList.remove("hide");
			GUESS_BTN.classList.add("hide");
			FORM_CONTAINER_CLASS.classList.add("hide");
		}

		GUESS_INPUT_CLASS.disabled = !this.guessesLimit;
		GUESS_BTN.disabled = !this.guessesLimit;
	}

	selectRandomWord() {
		const wordListLength = WORD_LIST.length;
		const randomNumber = Math.floor(Math.random() * wordListLength);
	  
		return WORD_LIST[randomNumber];
	}

	buildWordHTML() {
		const splitLetters = this.selectedWord.split('');
		let HTML = '';
		splitLetters.forEach(() => {
		  	HTML += `<span class="letter invalid-guess">
			<span class="letter-char">&bull;</span>
			</span>`;
		});
	  
		WIP_CLASS.innerHTML = HTML;
	}

	setInputFocus() {
		GUESS_INPUT_CLASS.focus();
	}

	startOver() {
		this.wrongGuesses = [];
		this.correctGuesses = [];
		this.guessesLimit = GUESSES_LIMIT;
		PLAY_AGAIN_BTN.classList.add("hide");
		GUESS_BTN.classList.remove("hide");
		FORM_CONTAINER_CLASS.classList.remove("hide");
		GUESSED_LETTERS_CLASS.innerHTML = '';
		this.render();
	}
}

const newGame = new GuessTheWordGame("Bryan");
newGame.render();