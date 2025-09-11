package com.afet.websocketservice.config;

import org.springframework.amqp.core.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${app.rabbitmq.exchange}")
    private String exchange;

    @Value("${app.rabbitmq.queues.map-update}")
    private String mapUpdateQueue;

    @Value("${app.rabbitmq.routing-keys.map-update}")
    private String mapUpdateRoutingKey;

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(exchange, true, false); // durable = true, autoDelete = false
    }

    @Bean
    public Queue mapUpdateQueue() {
        return new Queue(mapUpdateQueue, true); // durable = true
    }

    @Bean
    public Binding mapUpdateBinding(Queue mapUpdateQueue, TopicExchange exchange) {
        return BindingBuilder.bind(mapUpdateQueue).to(exchange).with(mapUpdateRoutingKey);
    }
}
