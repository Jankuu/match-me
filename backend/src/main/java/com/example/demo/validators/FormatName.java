package com.example.demo.validators;

public class FormatName {
    /**
     * Capitalizes first letter and every other letter after whitespace or after non-letter character.
     *
     * @param name The name of the user.
     * @return The formated name.
     */
    public static String getFormatedName(String name) {
        if (name.isEmpty()){
            return null;
        }
        // Initialize a StringBuilder to construct the resulting string
        StringBuilder capitalized = new StringBuilder();
        boolean capitalizeNext = true; // Flag to decide when to capitalize

        // Iterate through each character in the string
        for (int i = 0; i < name.length(); i++) {
            char currentChar = name.charAt(i);

            // If it's a letter, and we need to capitalize it
            if (Character.isLetter(currentChar)) {
                if (capitalizeNext) {
                    capitalized.append(Character.toUpperCase(currentChar)); // Capitalize
                } else {
                    capitalized.append(Character.toLowerCase(currentChar)); // Keep lowercase
                }
                capitalizeNext = false; // After a letter, we don't capitalize unless next is after space/non-letter
            } else {
                // Append the non-letter character (whitespace, dash, apostrophe, etc.)
                capitalized.append(currentChar);
                if (currentChar == ' ' || !Character.isLetter(currentChar)) {
                    capitalizeNext = true; // Capitalize the next letter after space or non-letter
                }
            }
        }

        return capitalized.toString();
    }
}
