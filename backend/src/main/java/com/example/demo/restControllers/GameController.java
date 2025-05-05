package com.example.demo.restControllers;

import com.example.demo.entities.Game;
import com.example.demo.services.GameService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/games")
public class GameController {
    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping
    public List<Game> getGames(){
        return gameService.getGames();
    }

    @GetMapping("/id")
    public Game getGameById(@RequestParam Long id){
        return gameService.getGameById(id);
    }

    @GetMapping("/search")
    public List<Game> getGameByName(@RequestParam String searchTerm){
        return gameService.getGameByName(searchTerm);
    }
}
