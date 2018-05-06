# core/

All the core services that run the games, servers, and threads live in here.
It is important to note that some of these files will be run in true separate
game threads.

If there is logic related to the actual GameObjects put it is probably wiser to
put that in `./base/` directory, because that is shared gameplay logic basic to
all games.

The general flow of gameplay is:

1. Cerveau starts up.
2. Lobby is awaiting any client connections.
3. Joueur.1 connects and wants to play "Checkers" in session "1".
4. Lobby now knows this client wants to play in Session "1" and waits for another player.
5. Joueur.2 connects and wants to play in any open session.
6. Lobby finds game session "1" is open and puts Joueur.2 in it.
7. Lobby now has enough player to make a reason Session "1" with two players, so the Lobby creates a new thread.
8. Child thread starts and creates Session instance and the parent thread sends clients 1 & 2.
9. Threaded Session runs game logic, communicating with clients via TCP until the game ends.
10. Before child thread exits it sends the gamelog back to the Lobby.
11. Lobby saves gamelog to disk in compressed json file.
