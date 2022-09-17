import { WordGame } from "../src/wordGame";

const mockedWordGame = WordGame as jest.Mock;

beforeEach(() => {
    mockedWordGame.mockClear();
});

it('We can check if method is called on class instance'), () => {
    expect(mockedWordGame).not.toHaveBeenCalled();

    //const newGame = new WordGame("test", "John");
}