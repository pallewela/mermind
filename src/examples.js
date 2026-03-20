export const EXAMPLES = {
  mindMapping: `mindmap
  root((What is Mind Mapping?))::icon(lightbulb)
    Capturing Ideas::icon(spark)
      Problem Solving
      Projects
      Brainstorming
    Planning::icon(checklist)
      Shopping Lists
      Vacation Checklists
      Project Management
      Weekly Goals
      Family Chores
      Homework
    Note taking::icon(pencil)
      Courses
      Presentations
      Lectures
      Studying
    Writing::icon(book)
      Essays
      Blogs
      Novels
      Thesis
      Articles
    Organizing::icon(pin)
      Organizational Charts
      Outline & Framework Design
      Structure & Relationships
    More::icon(hourglass)
      Family Trees
      Team Building
      Expressing Creativity
`,
  cafe: `mindmap
  root((Cafe))::icon(cup)
    Premise::icon(home)
      Repairs
      Detailed engineering
      Equipping
        Furniture
        Cookware
      Mounting
    Personnel::icon(people)
      Hire
      Training
    Product deliveries::icon(truck)
    Customers::icon(coins)
      Marketing
      Advertising
    Business plan::icon(calendar)
      Consulting
      Funding
    Concept::icon(star)
      Design
      Corporate identity
    Documents::icon(file)
      Business registration
      Fire inspection
      Sanitary regulations
    Competitors::icon(competition)
      Taxation
`,
  complex: `mindmap
  root((Postgres Outbox Functional Tests))
    PostgresPublisher[PostgreSQL Publisher]
      PollingAndProcessing[Polling and Processing]
        SingleEventPublish[Single event poll and publish]
        MultipleEventsInOrder[Multiple events in order]
        BatchSizeRespected[Batch size limit respected]
        PollIntervalTiming[Poll interval timing]
        EmptyPollCycle[Empty poll cycle no-op]
        EventHeaderPreservation[Event headers preserved in Kafka]
        EventPayloadIntegrity[Payload integrity JSON roundtrip]
        TopicRouting[Correct topic routing per event]
      CursorMgmt[Cursor Management]
        CursorAdvanceOnSuccess[Cursor advances on success]
        CursorNoAdvanceOnFailure[Cursor not advanced on failure]
        CursorResumeAfterRestart[Resume from cursor after restart]
        CursorPerSchema[Per-schema cursor isolation]
        CursorInitialState[Initial cursor is nil UUID]
        NoDuplicatesAfterRestart[No duplicate events after restart]
      SchemaDiscovery[Schema Discovery]
        InitialSchemaScan[Initial schema scan]
        ListenNotifyDetection[LISTEN/NOTIFY schema detection]
        PeriodicSchemaRefresh[Periodic schema refresh]
        SchemaCreatedAtRuntime[New schema detected at runtime]
        SchemaDroppedAtRuntime[Schema dropped stops processor]
        SystemSchemaExclusion[System schema exclusion]
        SchemaWithoutOutboxTable[Schema missing event_outbox ignored]
        SchemaWithoutCursorTable[Schema missing outbox_cursor ignored]
        SchemaPatternFiltering[Schema pattern regex filtering]
      ParallelVsSequential[Parallel vs Sequential]
        ParallelModeMultiSchema[Parallel mode multi-schema]
        SequentialModeSingleLoop[Sequential mode single loop]
        MaxConcurrentSchemasLimit[Max concurrent schemas limit]
        ProcessorStartStop[Processor start/stop lifecycle]
        ParallelSchemaIsolation[Schemas processed independently]
      ErrorRecoveryPostgres[Error Recovery]
        RetryBackoffOnPublishFail[Retry with backoff on Kafka failure]
        MaxRetriesExhausted[Max retries exhausted error]
        PostgresConnectionLoss[Postgres connection loss recovery]
        KafkaConnectionLoss[Kafka connection loss recovery]
        ListenReconnect[LISTEN connection auto-reconnect]
        PartialBatchFailure[Partial batch: cursor at last success]
        TransientKafkaError[Transient Kafka error retry]
      KafkaIntegration[Kafka Integration]
        SASLPlain[SASL PLAIN authentication]
        SASLSCRAM256[SASL SCRAM-SHA-256 authentication]
        SASLSCRAM512[SASL SCRAM-SHA-512 authentication]
        TLSEnabled[TLS enabled connection]
        TopicDoesNotExist[Topic does not exist error]
        KafkaRecordHeaders[Kafka record headers correct]
      ConfigAndValidation[Configuration]
        RequiredFieldValidation[Required field validation]
        SchemaPatternValidation[Schema pattern validation]
        SASLMechanismValidation[SASL mechanism validation]
        KafkaSecretFileWatch[Kafka secret file hot-reload]
        PollIntervalConfig[Poll interval configuration]
        BatchSizeConfig[Batch size configuration]
    EventSenderLib[Event Sender Library]
      PostgresSender[Postgres Sender]
        SendSingleEvent[Send single event]
        SendBatchEvents[Send batch events]
        UUIDv7Ordering[UUID v7 ordering guarantee]
        SessionContextUsage[Session from context required]
        TopicTemplateSubstitution[Topic template tenantId substitution]
        CloudEventWrapping[CloudEvent envelope structure]
        TraceContextInjection[Trace context injection into headers]
        InvalidEventRejected[Invalid event rejected]
        TenantIdFromProvider[Tenant ID resolved from provider]
      SharedEventTypes[Shared Event Types]
        TypedEventValidation[TypedEvent field validation]
        BoundedContextEventCreation[BoundedContext event creation]
        ExternalCommandRouting[External command topic routing]
        InternalCommandRouting[Internal command topic routing]
        DomainEventCreation[Domain event creation]
        PrivateHeaderInjection[ifsprivate header for commands]
        TopicTemplateWithBcName[Topic template with bcName]
    CrossCutting[Cross-Cutting Concerns]
      LeaderElection[Leader Election]
        LeaderGainsLease[Leader gains lease and starts processing]
        LeaderLosesLease[Leader loses lease and stops]
        LeaderElectionDisabled[Direct run when disabled]
        PodIdentityResolution[Pod identity from POD_NAME]
      Observability[Observability]
        EventsProcessedMetric[events_processed_total metric]
        BatchSizeMetric[batch_size histogram]
        PublishDurationMetric[publish_duration metric]
        PublishErrorsMetric[publish_errors_total metric]
        CursorUpdatesMetric[cursor_updates_total metric]
        PostgresConnectionStatus[Postgres connection status gauge]
        KafkaConnectionStatus[Kafka connection status gauge]
        SchemaProcessorActive[schema_processor_active gauge]
        TracePropagationE2E[Trace context propagated sender to Kafka]
        HealthEndpoints[Health check endpoints respond]
      GracefulShutdown[Graceful Shutdown]
        SIGTERMHandling[SIGTERM triggers graceful shutdown]
        SIGINTHandling[SIGINT triggers graceful shutdown]
        InFlightCompletion[In-flight events completed before exit]
        MetricsServerShutdown[Metrics server shuts down cleanly]
        SchemaProcessorsStop[All schema processors stopped]
    EndToEnd[End-to-End Scenarios]
      FullPipeline[App writes to Postgres outbox then Publisher delivers to Kafka]
      MultiSchemaE2E[Multi-schema full pipeline isolation]
      HighVolumeLoad[High volume throughput test]
      RestartRecoveryE2E[Publisher restart with no event loss]
      OrderingGuarantee[Event ordering preserved end-to-end]
      TraceE2E[Trace context flows from sender through Kafka]
`,
};

