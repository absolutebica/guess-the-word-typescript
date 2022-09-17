import {WordGame} from "./wordGame";

const playBtn = document.querySelector(".start-game") as HTMLButtonElement;
const newUser = document.querySelector(".new-user-name") as HTMLInputElement;
const userContainer = document.querySelector(".new-user.container") as HTMLDivElement;

playBtn.addEventListener("click", startGame);

function startGame() {
	const userName:string = newUser.value ?? "";
	if (userName) {
		const gameContainer = document.querySelector("#gameAreaContainer") as HTMLDivElement;
		const newGame = new WordGame(gameContainer, userName);
		newGame.render();
		userContainer.classList.add("hide");
		document.querySelector("#gameAreaContainer")?.classList.remove("hide");
	}
}