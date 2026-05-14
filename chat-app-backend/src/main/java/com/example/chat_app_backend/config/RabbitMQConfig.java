package com.example.chat_app_backend.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String CHAT_EXCHANGE = "chat.exchange";
    public static final String CHAT_QUEUE = "chat.queue.durable";
    public static final String CHAT_ROUTING_KEY = "chat.routing.#";

    public static final String TYPING_QUEUE = "typing.queue.durable";
    public static final String TYPING_ROUTING_KEY = "typing.routing.#";

    public static final String PRESENCE_QUEUE = "presence.queue.durable";
    public static final String PRESENCE_ROUTING_KEY = "presence.routing.#";

    @Bean
    public Queue chatQueue() {
        return new Queue(CHAT_QUEUE, true);
    }

    @Bean
    public Queue typingQueue() {
        return new Queue(TYPING_QUEUE, true);
    }

    @Bean
    public Queue presenceQueue() {
        return new Queue(PRESENCE_QUEUE, true);
    }

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(CHAT_EXCHANGE);
    }

    @Bean
    public Binding chatBinding(Queue chatQueue, TopicExchange exchange) {
        return BindingBuilder.bind(chatQueue).to(exchange).with(CHAT_ROUTING_KEY);
    }

    @Bean
    public Binding typingBinding(Queue typingQueue, TopicExchange exchange) {
        return BindingBuilder.bind(typingQueue).to(exchange).with(TYPING_ROUTING_KEY);
    }

    @Bean
    public Binding presenceBinding(Queue presenceQueue, TopicExchange exchange) {
        return BindingBuilder.bind(presenceQueue).to(exchange).with(PRESENCE_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return new Jackson2JsonMessageConverter(mapper);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        final RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
