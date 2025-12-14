import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InMemoryEventBus, resetEventBus } from './event-bus';
import { LeadCreatedEvent, LeadStatusChangedEvent } from '@/core/domain/events/lead-events';
import { SubmissionCreatedEvent } from '@/core/domain/events/submission-events';

describe('InMemoryEventBus', () => {
  let eventBus: InMemoryEventBus;

  beforeEach(() => {
    resetEventBus();
    eventBus = new InMemoryEventBus();
  });

  describe('Handler Registration', () => {
    it('should register a handler for an event type', () => {
      const handler = vi.fn();

      eventBus.on('LeadCreated', handler);

      expect(eventBus.listenerCount('LeadCreated')).toBe(1);
    });

    it('should register multiple handlers for the same event type', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      eventBus.on('LeadCreated', handler1);
      eventBus.on('LeadCreated', handler2);
      eventBus.on('LeadCreated', handler3);

      expect(eventBus.listenerCount('LeadCreated')).toBe(3);
    });

    it('should register handlers for different event types', () => {
      const leadHandler = vi.fn();
      const submissionHandler = vi.fn();

      eventBus.on('LeadCreated', leadHandler);
      eventBus.on('SubmissionCreated', submissionHandler);

      expect(eventBus.listenerCount('LeadCreated')).toBe(1);
      expect(eventBus.listenerCount('SubmissionCreated')).toBe(1);
    });
  });

  describe('Event Emission', () => {
    it('should emit event to registered handlers', async () => {
      const handler = vi.fn();
      eventBus.on('LeadCreated', handler);

      const event = new LeadCreatedEvent({
        leadId: 'lead-123',
        organizationId: 'org-123',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'NEW',
        source: 'WEBSITE',
      });

      await eventBus.emit(event);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should emit event to multiple handlers', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      eventBus.on('LeadCreated', handler1);
      eventBus.on('LeadCreated', handler2);
      eventBus.on('LeadCreated', handler3);

      const event = new LeadCreatedEvent({
        leadId: 'lead-123',
        organizationId: 'org-123',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'NEW',
        source: 'WEBSITE',
      });

      await eventBus.emit(event);

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);
    });

    it('should not throw error when emitting event with no handlers', async () => {
      const event = new LeadCreatedEvent({
        leadId: 'lead-123',
        organizationId: 'org-123',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'NEW',
        source: 'WEBSITE',
      });

      await expect(eventBus.emit(event)).resolves.not.toThrow();
    });

    it('should handle async handlers', async () => {
      const asyncHandler = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      eventBus.on('LeadCreated', asyncHandler);

      const event = new LeadCreatedEvent({
        leadId: 'lead-123',
        organizationId: 'org-123',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'NEW',
        source: 'WEBSITE',
      });

      await eventBus.emit(event);

      expect(asyncHandler).toHaveBeenCalledTimes(1);
    });

    it('should not propagate errors from handlers', async () => {
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error');
      });
      const normalHandler = vi.fn();

      eventBus.on('LeadCreated', errorHandler);
      eventBus.on('LeadCreated', normalHandler);

      const event = new LeadCreatedEvent({
        leadId: 'lead-123',
        organizationId: 'org-123',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'NEW',
        source: 'WEBSITE',
      });

      await expect(eventBus.emit(event)).resolves.not.toThrow();
      expect(errorHandler).toHaveBeenCalled();
      expect(normalHandler).toHaveBeenCalled();
    });
  });

  describe('Handler Removal', () => {
    it('should remove a specific handler', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on('LeadCreated', handler1);
      eventBus.on('LeadCreated', handler2);

      expect(eventBus.listenerCount('LeadCreated')).toBe(2);

      eventBus.off('LeadCreated', handler1);

      expect(eventBus.listenerCount('LeadCreated')).toBe(1);
    });

    it('should remove all handlers for an event type', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on('LeadCreated', handler1);
      eventBus.on('LeadCreated', handler2);

      expect(eventBus.listenerCount('LeadCreated')).toBe(2);

      eventBus.removeAllListeners('LeadCreated');

      expect(eventBus.listenerCount('LeadCreated')).toBe(0);
    });

    it('should remove all handlers for all event types', () => {
      eventBus.on('LeadCreated', vi.fn());
      eventBus.on('LeadCreated', vi.fn());
      eventBus.on('SubmissionCreated', vi.fn());

      eventBus.removeAllListeners();

      expect(eventBus.listenerCount('LeadCreated')).toBe(0);
      expect(eventBus.listenerCount('SubmissionCreated')).toBe(0);
    });
  });

  describe('Event History', () => {
    it('should store emitted events in history', async () => {
      const event1 = new LeadCreatedEvent({
        leadId: 'lead-1',
        organizationId: 'org-123',
        name: 'Lead 1',
        email: 'lead1@example.com',
        status: 'NEW',
        source: 'WEBSITE',
      });

      const event2 = new LeadStatusChangedEvent({
        leadId: 'lead-1',
        organizationId: 'org-123',
        previousStatus: 'NEW',
        newStatus: 'CONTACTED',
      });

      await eventBus.emit(event1);
      await eventBus.emit(event2);

      const history = eventBus.getEventHistory();

      expect(history).toHaveLength(2);
      expect(history[0].type).toBe('LeadCreated');
      expect(history[1].type).toBe('LeadStatusChanged');
    });

    it('should limit history size', async () => {
      const smallBus = new InMemoryEventBus(5);

      for (let i = 0; i < 10; i++) {
        await smallBus.emit(
          new LeadCreatedEvent({
            leadId: `lead-${i}`,
            organizationId: 'org-123',
            name: `Lead ${i}`,
            email: `lead${i}@example.com`,
            status: 'NEW',
            source: 'WEBSITE',
          })
        );
      }

      const history = smallBus.getEventHistory();
      expect(history).toHaveLength(5);
    });

    it('should clear history', async () => {
      const event = new LeadCreatedEvent({
        leadId: 'lead-123',
        organizationId: 'org-123',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'NEW',
        source: 'WEBSITE',
      });

      await eventBus.emit(event);

      expect(eventBus.getEventHistory()).toHaveLength(1);

      eventBus.clearHistory();

      expect(eventBus.getEventHistory()).toHaveLength(0);
    });
  });

  describe('Stats and Utilities', () => {
    it('should return correct stats', () => {
      eventBus.on('LeadCreated', vi.fn());
      eventBus.on('LeadCreated', vi.fn());
      eventBus.on('SubmissionCreated', vi.fn());

      const stats = eventBus.getStats();

      expect(stats.totalEventTypes).toBe(2);
      expect(stats.totalHandlers).toBe(3);
      expect(stats.eventTypes).toContain('LeadCreated');
      expect(stats.eventTypes).toContain('SubmissionCreated');
    });

    it('should return registered event types', () => {
      eventBus.on('LeadCreated', vi.fn());
      eventBus.on('SubmissionCreated', vi.fn());

      const eventTypes = eventBus.getRegisteredEventTypes();

      expect(eventTypes).toContain('LeadCreated');
      expect(eventTypes).toContain('SubmissionCreated');
      expect(eventTypes).toHaveLength(2);
    });
  });

  describe('Event Properties', () => {
    it('should create event with correct properties', () => {
      const event = new LeadCreatedEvent(
        {
          leadId: 'lead-123',
          organizationId: 'org-123',
          name: 'John Doe',
          email: 'john@example.com',
          status: 'NEW',
          source: 'WEBSITE',
          value: 50000,
        },
        {
          userId: 'user-123',
          ipAddress: '192.168.1.1',
        }
      );

      expect(event.type).toBe('LeadCreated');
      expect(event.leadId).toBe('lead-123');
      expect(event.name).toBe('John Doe');
      expect(event.email).toBe('john@example.com');
      expect(event.occurredAt).toBeInstanceOf(Date);
      expect(event.eventId).toMatch(/^LeadCreated-/);
      expect(event.metadata?.userId).toBe('user-123');
    });

    it('should serialize event to JSON', () => {
      const event = new LeadCreatedEvent({
        leadId: 'lead-123',
        organizationId: 'org-123',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'NEW',
        source: 'WEBSITE',
      });

      const json = event.toJSON();

      expect(json.type).toBe('LeadCreated');
      expect(json.payload.leadId).toBe('lead-123');
      expect(json.occurredAt).toBeTruthy();
      expect(json.eventId).toBeTruthy();
    });
  });
});
