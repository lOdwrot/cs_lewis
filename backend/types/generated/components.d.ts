import type { Schema, Struct } from '@strapi/strapi';

export interface BiographyEvent extends Struct.ComponentSchema {
  collectionName: 'components_biography_events';
  info: {
    description: 'Single event in the CS Lewis biography timeline';
    displayName: 'Biography Event';
    icon: 'calendar';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    year: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface FooterSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_footer_social_links';
  info: {
    description: 'A social media link with an icon image and a redirect URL';
    displayName: 'Social Link';
    icon: 'link';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'>;
    redirectUrl: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomeNavLink extends Struct.ComponentSchema {
  collectionName: 'components_home_nav_links';
  info: {
    description: 'Configurable button on the home page hero \u2014 can scroll to a section on the home page or navigate to a root page';
    displayName: 'Nav Link';
    icon: 'link';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    target: Schema.Attribute.Enumeration<
      [
        'gates-section',
        'news-section',
        'home',
        'portal',
        'journeys',
        'library',
        'biography',
        'encyclopedia',
        'books',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'gates-section'>;
  };
}

export interface MenuNavItem extends Struct.ComponentSchema {
  collectionName: 'components_menu_nav_items';
  info: {
    description: 'A navigable item in the top menu bar';
    displayName: 'Nav Item';
    icon: 'link';
  };
  attributes: {
    hoverText: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    redirect: Schema.Attribute.Enumeration<
      [
        'home',
        'portal',
        'journeys',
        'library',
        'biography',
        'encyclopedia',
        'books',
        'news',
        'publikacje',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'home'>;
  };
}

export interface StepPodcastContent extends Struct.ComponentSchema {
  collectionName: 'components_step_podcast_contents';
  info: {
    description: 'Audio URL and optional transcript';
    displayName: 'Podcast Content';
    icon: 'headphones';
  };
  attributes: {
    audioFile: Schema.Attribute.Media<'audios'>;
    audioUrl: Schema.Attribute.String;
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
      'biography.event': BiographyEvent;
      'footer.social-link': FooterSocialLink;
      'home.nav-link': HomeNavLink;
      'menu.nav-item': MenuNavItem;
      'step.podcast-content': StepPodcastContent;
      'step.quiz-content': StepQuizContent;
      'step.text-content': StepTextContent;
    }
  }
}
