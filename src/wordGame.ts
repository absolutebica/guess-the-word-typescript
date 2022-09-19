// Element Classes
const MESSAGE_CLASS = ".message";
const WIP_CLASS = ".word-in-progress";
const GUESSES_REMAINING_CLASS = ".remaining";
const GUESSED_LETTERS_CLASS = ".guessed-letters";
const ALREADY_GUESSED_CLASS = ".already-guessed";
const FORM_CONTAINER_CLASS = ".form-container";
const GUESS_INPUT_CLASS = ".input-letter";
const GUESS_BTN = ".guess";
const PLAY_AGAIN_BTN = ".play-again";

// Api
const WordAPI = 'https://random-word-api.herokuapp.com/word';

// Messages
const SUCCESS_MESSAGE = "I can't believe you won. Great job Einstein!";
const FAIL_MESSAGE = "Sorry! No soup for you!"

const SELECTED_WORD = '';
const GUESSES_LIMIT = 6;

const TEMPLATE = `<p class="message"></p>
<span class="loader hide"></span>
<p class="word-in-progress"></p>
<p class="remaining"></p>
<ul class="guessed-letters"></ul>
<div class="form-container">
    <label for="letter">Type one letter:</label>
    <input type="text" name="letter" class="input-letter" maxlength="1" />
</div>
<div class="already-guessed hide">Letter already guessed</div>
<div class="form-element button-element">
    <button class="guess">Guess!</button>
</div>
<button class="play-again hide">Play Again!</button>`;

// Type of properties in selectedWordLetters array
type SelectedWordLetters = {
	letter: string,
	index: number,
	used: boolean
}

export class WordGame {
	#el: HTMLElement;
    #name: string;
	#selectedWord: string;
	#selectedWordLetters: SelectedWordLetters[];
	#guessesLimit: number;
	#wrongGuesses: string[];

	constructor(container: HTMLDivElement, name: string) {
		this.#el = container ? container : document.createElement("div");
		this.#name = name;
		this.#selectedWord = SELECTED_WORD;
		this.#guessesLimit = GUESSES_LIMIT;
		this.#wrongGuesses = [];
		this.#selectedWordLetters = [];
	}

	#template() {
		this.#el.classList.add("game-container");
		this.#el.innerHTML = TEMPLATE;
	}

	render() {
		this.#template();
		this.#newGame();
		this.#events();
		this.#getElements().messageEl.innerHTML = `${this.#name}, welcome to Guess the Word`;
	}

	#events() {
		const $guessBtn = this.#getElements().guessBtnEl;
		const $playBtn = this.#getElements().playBtnEl;
		const $guessInput = this.#getElements().guessInputEl;
		$guessBtn.addEventListener("click", () => this.#checkLetter());
		$playBtn.addEventListener("click", () => this.#newGame());
		$guessInput.addEventListener("keypress", (event) => this.#validateInput(event));
		$guessInput.addEventListener("keydown", event => this.#onEnterKey(event));
	}

	#validateInput(event:KeyboardEvent){
		const isValid = /^[a-zA-Z]+$/.test(event.key);
	
		if (!isValid) {
			event.preventDefault();
			return false;
		}
	}
	#onEnterKey(event:KeyboardEvent) {
		const isEnterKey = event.key === "Enter";
		const isGuessInputValid = !!this.#getInputValue();
		if (isEnterKey && isGuessInputValid) {
			this.#checkLetter();
		}
	}

	#getElement(querySelector:string) {
		if (querySelector) {
			return this.#el.querySelector(querySelector);
		}
	}

	#getElements() {
		return {
			guessBtnEl: this.#getElement(GUESS_BTN) as HTMLButtonElement,
			playBtnEl: this.#getElement(PLAY_AGAIN_BTN) as HTMLButtonElement,
			guessInputEl: this.#getElement(GUESS_INPUT_CLASS) as HTMLInputElement,
			messageEl: this.#getElement(MESSAGE_CLASS) as HTMLParagraphElement,
			formContainerEl : this.#getElement(FORM_CONTAINER_CLASS) as HTMLDivElement,
			guessLettersEl: this.#getElement(GUESSED_LETTERS_CLASS) as HTMLUListElement,
			alreadyGuessedEl: this.#getElement(ALREADY_GUESSED_CLASS) as HTMLDivElement,
			wordInProgressEl: this.#getElement(WIP_CLASS) as HTMLParagraphElement,
			guessesRemainingEl: this.#getElement(GUESSES_REMAINING_CLASS) as HTMLParagraphElement,
			loaderEl: this.#getElement(".loader") as HTMLSpanElement
		}
	}

    #newGame() {
		this.#resetGame();
		this.#setupWord();
		this.#setInputFocus();
		this.#getElements().messageEl.innerHTML = `${this.#name}, let's do it again!`;
	}

    #resetGame() {
		this.#wrongGuesses = [];
		this.#guessesLimit = GUESSES_LIMIT;
		this.#selectedWordLetters = [];
		this.#selectedWord = SELECTED_WORD;

		this.#getElements().playBtnEl.classList.add("hide");
		this.#getElements().guessBtnEl.classList.remove("hide");
		this.#getElements().formContainerEl.classList.remove("hide");
		this.#getElements().guessLettersEl.innerHTML = '';
	}

    #setupWord() {
		this.#getElements().loaderEl.classList.remove("hide");
		this.#fetchRandomWord().then((word) => {
			this.#getElements().loaderEl.classList.add("hide");
			this.#selectedWord = word;
			this.#setInitialRemainingGuesses();
			this.#buildWordMask();
			this.#updateRemainingGuessesMessage();

			console.warn(`Shhhh the word is ${word}`);
		});
	}

	#getInputValue() {
		return this.#getElements().guessInputEl.value;
	}

	#checkLetter() {
		const letter = this.#getInputValue();
		if (letter?.length && this.#guessesLimit) {
			this.#testLetterInWord(letter);
			this.#getElements().guessInputEl.value = "";
			this.#setInputFocus();
		}
	}

    #setInputFocus() {
		this.#getElements().guessInputEl.focus();
	}

	#testLetterInWord(letter:string) {
		const regexp = new RegExp(letter, "g");
		const selectedWordletterMatchesCount:number = (this.#selectedWord.match(regexp) || []).length;
		const correctLetterGuessCount:number = this.#selectedWordLetters.filter(wordLetter => {
			return (wordLetter.letter.toLowerCase() === letter.toLowerCase())
			&& wordLetter.used
			}).length;

		const hasWrongMatch = !!this.#wrongGuesses.filter(guess => guess.toLowerCase() === letter.toLowerCase()).length;

		if (hasWrongMatch || (selectedWordletterMatchesCount && correctLetterGuessCount >= selectedWordletterMatchesCount)) {
			this.#getElements().alreadyGuessedEl.classList.remove("hide");
		} else {
			if (selectedWordletterMatchesCount) {

				this.#updateCorrectLetter(letter);
				this.#checkIfWinner();
			} else {
				this.#guessesLimit--;
				this.#wrongGuesses.push(letter);
				this.#updateIncorrectLetters();
				this.#updateRemainingGuessesMessage();
			}

			this.#getElements().alreadyGuessedEl.classList.add("hide");
		}
	}

	#updateCorrectLetter(letter:string) {
			const findValidLetter = this.#selectedWordLetters.find(wordLetter => {
				return wordLetter.letter.toLowerCase() === letter.toLowerCase()
				&& !wordLetter.used;
			});

			const letterPosition = findValidLetter?.index ?? -1;
			const letterElements = this.#getElements().wordInProgressEl.children;
			if (letterPosition > -1 && findValidLetter) {
				letterElements[letterPosition].innerHTML = letter;
				letterElements[letterPosition].classList.remove("invalid-guess");
				findValidLetter.used = true;
			}
	}

	#updateIncorrectLetters() {
		this.#getElements().guessLettersEl.innerHTML = '';
		this.#wrongGuesses.forEach(letter => {
			const incorrectLetterElement = document.createElement('span');
			incorrectLetterElement.classList.add("incorrect-letter");
			incorrectLetterElement.textContent = letter;
			this.#getElements().guessLettersEl.append(incorrectLetterElement);
		});

		this.#getElements().guessLettersEl.classList.remove("hide");
	}

	#buildWordMask() {
		const splitLetters = this.#selectedWord.split('');
		let HTML = '';
		splitLetters.forEach((letter, index) => {
			this.#selectedWordLetters.push(
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

		this.#getElements().wordInProgressEl.innerHTML = HTML;
	}

	#setInitialRemainingGuesses() {
		this.#guessesLimit = this.#selectedWord.length + 2;
	}

	#updateRemainingGuessesMessage() {
		const guessMessage = this.#guessesLimit ? `You have <span class="danger">${this.#guessesLimit} incorrect guesses</span> remaining.` : FAIL_MESSAGE;
		this.#getElements().guessesRemainingEl.innerHTML = guessMessage;
		this.#getElements().guessesRemainingEl.classList.remove("hide");
		this.#updateButtonStates();
	}

	#updateButtonStates() {
		if (!this.#guessesLimit) {
			this.#getElements().playBtnEl.classList.remove("hide");
			this.#getElements().guessBtnEl.classList.add("hide");
			this.#getElements().formContainerEl.classList.add("hide");
		}

		this.#getElements().guessInputEl.disabled = !this.#guessesLimit;
		this.#getElements().guessBtnEl.disabled = !this.#guessesLimit;
	}

	async #fetchRandomWord() {
		return await fetch(WordAPI)
			.then(response => response.json())
			.then(wordData => wordData?.[0])
	}

	#checkIfWinner() {
		// If no selected word letters are unused, we have a winner at this point
		const isWinner = this.#guessesLimit && !this.#selectedWordLetters.filter(wordLetter => !wordLetter.used).length;
		isWinner && this.#gameWon();
	}

	#gameWon() {
		this.#getElements().playBtnEl.classList.remove("hide");
		this.#getElements().guessBtnEl.classList.add("hide");
		this.#getElements().formContainerEl.classList.add("hide");
		this.#getElements().guessesRemainingEl.classList.add("hide");
		this.#getElements().guessLettersEl.classList.add("hide");
		this.#getElements().messageEl.innerHTML = SUCCESS_MESSAGE;
	}
}