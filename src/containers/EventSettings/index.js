import React, {useEffect, useState} from 'react';
import Intro from "./views/Intro";
import Main from "./views/Main";
import Tickets from "./views/Tickets";
import Associations from "./views/Associations";
import Relations from "../PostConnectionsView";
import Links from "../RentSettings/views/PostLinksView";
import {useDispatch} from "react-redux";
import {setEventPostSettingsInitialFormData} from "../../store/actions/postActions";
import "./index.scss"

const EventSettings = ({eventID, onBack, showIntroView = false}) => {
  const dispatch = useDispatch()
  const VIEWS = Object.freeze({
    main: 'main',
    intro: 'intro',
    tickets: 'tickets',
    associations: 'associations',
    relations: 'relations',
    links: 'links',
  })

  const [view, setView] = useState(showIntroView ? VIEWS.intro : VIEWS.main);

  const nextView = view => () => setView(view)

  useEffect(() => {
    return () => {
      dispatch(setEventPostSettingsInitialFormData(null))
    }
  }, [dispatch]);

  return (
    <div className="event-settings">
      {view === VIEWS.intro && (
        <Intro
          onBack={onBack}
          onNext={nextView(VIEWS.main)}
        />
      )}
      {view === VIEWS.main && (
        <Main
          eventID={eventID}
          onBack={showIntroView ? nextView(VIEWS.intro) : onBack}
          onSubmit={onBack}
          onTicketSettings={nextView(VIEWS.tickets)}
          onAddAssociations={nextView(VIEWS.relations)}
        />
      )}
      {view === VIEWS.tickets && (
        <Tickets
          eventID={eventID}
          onBack={nextView(VIEWS.main)}
        />
      )}
      {view === VIEWS.associations && (
        <Associations
          eventID={eventID}
          onBack={nextView(VIEWS.main)}
        />
      )}
      {view === VIEWS.relations && (
        <Relations
          postID={eventID}
          onBack={nextView(VIEWS.main)}
          onAddRelatedItems={nextView(VIEWS.associations)}
          onAddLinks={nextView(VIEWS.links)}
        />
      )}
      {view === VIEWS.links && (
        <Links
          postID={eventID}
          onBack={nextView(VIEWS.relations)}
          onSubmit={nextView(VIEWS.relations)}
        />
      )}
    </div>
  );
};

export default EventSettings;