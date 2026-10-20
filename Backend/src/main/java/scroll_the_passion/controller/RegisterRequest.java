
package scroll_the_passion.controller;

public record RegisterRequest(
    String fullName,
    String username,
    String email,
    String password
) {}
