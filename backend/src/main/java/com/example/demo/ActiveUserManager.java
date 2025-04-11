package com.example.demo;

import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ActiveUserManager {
    private final Set<String> activeUsers = ConcurrentHashMap.newKeySet();

    public void add(String username) {
        activeUsers.add(username);
    }

    public void remove(String username) {
        activeUsers.remove(username);
    }

    public Set<String> getAll() {
        return new HashSet<>(activeUsers);
    }
}