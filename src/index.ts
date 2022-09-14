const WORD_LIST:string[] = [
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
  
const MESSAGE_CLASS = document.querySelector(".message") as HTMLParagraphElement;
const WIP_CLASS = document.querySelector(".word-in-progress") as HTMLParagraphElement;
const GUESSES_REMAINING_CLASS = document.querySelector(".remaining") as HTMLParagraphElement;
const GUESSED_LETTERS_CLASS = document.querySelector(".guessed-letters") as HTMLUListElement;
const GUESS_BTN = document.querySelector("button.guess") as HTMLButtonElement;
const GUESS_INPUT_CLASS = document.querySelector("input.letter") as HTMLInputElement;
const ALREADY_GUESSED_CLASS = document.querySelector(".already-guessed") as HTMLDivElement;
const PLAY_AGAIN_BTN = document.querySelector("button.play-again") as HTMLButtonElement;
const FORM_CONTAINER_CLASS = document.querySelector(".form-container") as HTMLDivElement;

let SELECTED_WORD:string = '';
let GUESSES_LIMIT:number = 6;
const SUCCESS_MESSAGE:string = "I can't believe you won. Great job Einstein!";
const FAIL_MESSAGE:string = "Sorry! No soup for you!"

type SelectedWordLetters = {
	letter:string,
	index: number,
	used: boolean
}

class GuessTheWordGame {
	name: string;
	selectedWord: string;
	selectedWordLetters: SelectedWordLetters[];
	guessesLimit: number;
	wrongGuesses: string[];
	correctGuesses: string[];

	constructor(name:string) {
		this.name = name;
		this.selectedWord = SELECTED_WORD;
		this.guessesLimit = GUESSES_LIMIT;
		this.wrongGuesses = [];
		this.correctGuesses = [];
		this.selectedWordLetters = [];
	}

	render() {
		MESSAGE_CLASS.innerHTML = `${this.name}, welcome to Guess the Word`;
		this.selectedWord = this.selectRandomWord();
		this.selectedWordLetters = [];
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

	checkInputGuess() {
		const letter = GUESS_INPUT_CLASS.value;
		if (letter?.length && this.guessesLimit) {
			this.testLetterInWord(letter);
			GUESS_INPUT_CLASS.value = "";
			this.setInputFocus();
		}
	}

	onGuessInput(event:KeyboardEvent) {
		const isValid = /^[a-zA-Z]+$/.test(event.key);

		if (!isValid) {
			event.preventDefault();
			return false;
		}
	}

	onEnterKey(event:KeyboardEvent) {
		const isEnterKey = event.key === "Enter";
		const isGuessInputValid = !!GUESS_INPUT_CLASS.value;
		if (isEnterKey && isGuessInputValid) {
			this.checkInputGuess();
		}
	}

	testLetterInWord(letter:string) {
		const regexp = new RegExp(letter, "g");
		const letterMatchesCount:number = (this.selectedWord.match(regexp) || []).length;
		const correctGuessesCount:number = this.correctGuesses.filter(guess => guess.toLowerCase() === letter.toLowerCase()).length;
		const hasWrongMatch = !!this.wrongGuesses.filter(guess => guess.toLowerCase() === letter.toLowerCase()).length;

		if (hasWrongMatch || (letterMatchesCount && correctGuessesCount >= letterMatchesCount)) {
			ALREADY_GUESSED_CLASS.classList.remove("hide");
		} else {
			if (letterMatchesCount) {
				this.correctGuesses.push(letter);
				this.updateCorrectLetters();
			} else {
				this.guessesLimit--;
				this.wrongGuesses.push(letter);
				this.updateIncorrectLetters();
			}

			ALREADY_GUESSED_CLASS.classList.add("hide");
		}

		this.didYouWin();
	}

	updateCorrectLetters() {
		this.correctGuesses.forEach(letter => {
			const findLetter = this.selectedWordLetters.find(wordLetter => {
				return wordLetter.letter.toLowerCase() === letter.toLowerCase()
				&& !wordLetter.used;
			});

			const letterPosition = findLetter?.index ?? -1;
			const letterElements = WIP_CLASS.children;
			if (letterPosition > -1 && findLetter) {
				letterElements[letterPosition].innerHTML = letter;
				letterElements[letterPosition].classList.remove("invalid-guess");
				findLetter.used = true;
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

		GUESSED_LETTERS_CLASS.classList.remove("hide");
	}

	initialRemainingGuesses() {
		this.guessesLimit = this.selectedWord.length + 2;
		this.updateRemainingGuessesMessage();
	}

	updateRemainingGuessesMessage() {
		const guessMessage = this.guessesLimit ? `You have <span class="danger">${this.guessesLimit} incorrect guesses</span> remaining.` : FAIL_MESSAGE;
		GUESSES_REMAINING_CLASS.innerHTML = guessMessage;
		GUESSES_REMAINING_CLASS.classList.remove("hide");
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
		splitLetters.forEach((letter, index) => {
			this.selectedWordLetters.push(
				{
					letter: letter,
					index: index,
					used: false
				}
			);
			
		  	HTML += `<span class="letter invalid-guess">
			<span class="letter-char">&bull;</span>
			</span>`;
		});
	  
		WIP_CLASS.innerHTML = HTML;
	}

	setInputFocus() {
		GUESS_INPUT_CLASS.focus();
	}

	didYouWin() {
		if (this.selectedWord.length === this.correctGuesses.length) {
			this.gameWon();
		} else {
			this.updateRemainingGuessesMessage();
		}
	}

	gameWon() {
		PLAY_AGAIN_BTN.classList.remove("hide");
		GUESS_BTN.classList.add("hide");
		FORM_CONTAINER_CLASS.classList.add("hide");
		GUESSES_REMAINING_CLASS.classList.add("hide");
		GUESSED_LETTERS_CLASS.classList.add("hide");
		MESSAGE_CLASS.innerHTML = SUCCESS_MESSAGE;
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