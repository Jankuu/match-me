package com.example.demo.utilities;

import lombok.Data;

import java.util.List;

@Data
public class Response {
    private List<?> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean last;
}