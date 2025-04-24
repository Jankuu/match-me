package com.example.demo;       // ➜ укажи фактический пакет

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.example.demo.webSocket.WebSocketMessageInterceptor;   // если класс лежит здесь же
// ↑ поправь путь, если interceptor в другом пакете

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfigOld implements WebSocketMessageBrokerConfigurer {

    private final WebSocketMessageInterceptor messageInterceptor;

    public WebSocketConfigOld(WebSocketMessageInterceptor messageInterceptor) {
        this.messageInterceptor = messageInterceptor;
    }

    /** добавляем перехватчик входящих сообщений */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(messageInterceptor);
    }

    /** точка подключения STOMP + SockJS */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")                                 // native WS
                .setAllowedOriginPatterns("http://localhost:5173")  // фронт
                .withSockJS()                                       // /ws/info и т.д.
                .setSessionCookieNeeded(false);
    }

    /** префиксы приложений и simple‑broker */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic");
    }
}
