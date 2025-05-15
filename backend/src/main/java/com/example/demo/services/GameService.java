package com.example.demo.services;

import com.example.demo.entities.Game;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.GameRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GameService {
    private final GameRepository gameRepository;

    public GameService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    public List<Game> getGames() {
        return gameRepository.findAll();
    }
}
