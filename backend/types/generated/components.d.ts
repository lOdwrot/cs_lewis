import type { Schema, Struct } from '@strapi/strapi';

export interface StepPodcastContent extends Struct.ComponentSchema {
  collectionName: 'components_step_podcast_contents';
  info: {
    description: 'Audio URL and optional transcript';
    displayName: 'Podcast Content';
    icon: 'headphones';
  };
  attributes: {
    audioUrl: Schema.Attribute.String & Schema.Attribute.Required;
    transcript: Schema.Attribute.RichText;
  };
}

export interface StepQuizContent extends Struct.ComponentSchema {
  collectionName: 'components_step_quiz_contents';
  info: {
    description: 'Quiz questions stored as JSON';
    displayName: 'Quiz Content';
    icon: 'check-square';
  };
  attributes: {
    questions: Schema.Attribute.JSON & Schema.Attribute.Required;
  };
}

export interface StepTextContent extends Struct.ComponentSchema {
  collectionName: 'components_step_text_contents';
  info: {
    description: 'Markdown text with optional video URL';
    displayName: 'Text Content';
    icon: 'file-alt';
  };
  attributes: {
    markdown: Schema.Attribute.RichText;
    videoUrl: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'step.podcast-content': StepPodcastContent;
      'step.quiz-content': StepQuizContent;
      'step.text-content': StepTextContent;
    }
  }
}
