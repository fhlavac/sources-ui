import React from 'react';
import { mount } from 'enzyme';
import { Modal, Button, Text } from '@patternfly/react-core';
import configureStore from 'redux-mock-store';
import { MemoryRouter, Route } from 'react-router-dom';
import { act } from 'react-dom/test-utils';

import RemoveAppModal from '../../../components/AddApplication/RemoveAppModal';
import * as actions from '../../../redux/sources/actions';
import { routes, replaceRouteId } from '../../../Routes';
import { componentWrapperIntl } from '../../../utilities/testsHelpers';

describe('RemoveAppModal', () => {
  let store;
  let mockStore;
  let initialEntry;
  let initialStore;

  const APP_ID = '187894151315';
  const APP2_ID = '18789sadsa4151315';
  const SOURCE_ID = '15';
  const SUCCESS_MSG = expect.any(String);
  const ERROR_MSG = expect.any(String);

  const APP1 = 'APP_1';
  const APP2 = 'APP_2';
  const APP1_DISPLAY_NAME = 'APP_1';
  const APP2_DISPLAY_NAME = 'APP_2';

  const APP_TYPES = [
    {
      id: 1,
      display_name: APP1_DISPLAY_NAME,
      name: APP1,
      dependent_applications: [],
    },
    {
      id: 2,
      name: APP2,
      display_name: APP2_DISPLAY_NAME,
      dependent_applications: [APP1],
    },
  ];
  beforeEach(() => {
    initialStore = {
      sources: {
        appTypes: APP_TYPES,
        entities: [{ id: SOURCE_ID, applications: [{ id: APP_ID, application_type_id: 1 }] }],
      },
    };
    mockStore = configureStore();
    store = mockStore(initialStore);
    initialEntry = [replaceRouteId(routes.sourcesDetailRemoveApp.path, SOURCE_ID).replace(':app_id', APP_ID)];
  });

  it('renders correctly', () => {
    const wrapper = mount(
      componentWrapperIntl(
        <Route path={routes.sourcesDetailRemoveApp.path} render={(...args) => <RemoveAppModal {...args} />} />,
        store,
        initialEntry
      )
    );

    expect(wrapper.find(Modal).length).toEqual(1);
    expect(wrapper.find(Button).length).toEqual(3); // modal cancel, remove, cancel
    expect(wrapper.find(Button).at(1).text()).toEqual('Remove');
    expect(wrapper.find(Button).last().text()).toEqual('Cancel');
  });

  it('redirect when app does not exist', async () => {
    let wrapper;

    initialStore = {
      sources: {
        appTypes: APP_TYPES,
        entities: [{ id: SOURCE_ID, applications: [] }],
      },
    };
    mockStore = configureStore();
    store = mockStore(initialStore);

    await act(async () => {
      wrapper = mount(
        componentWrapperIntl(
          <Route path={routes.sourcesDetailRemoveApp.path} render={(...args) => <RemoveAppModal {...args} />} />,
          store,
          initialEntry
        )
      );
    });
    wrapper.update();

    expect(wrapper.find(MemoryRouter).instance().history.location.pathname).toEqual(
      replaceRouteId(routes.sourcesDetail.path, SOURCE_ID)
    );
  });

  it('renders correctly with attached dependent applications', () => {
    initialEntry = [replaceRouteId(routes.sourcesDetailRemoveApp.path, SOURCE_ID).replace(':app_id', APP2_ID)];
    store = mockStore({
      sources: {
        ...initialStore.sources,
        entities: [
          {
            id: SOURCE_ID,
            applications: [
              { id: APP_ID, application_type_id: 1 },
              { id: APP2_ID, application_type_id: 2 },
            ],
          },
        ],
      },
    });

    const wrapper = mount(
      componentWrapperIntl(
        <Route path={routes.sourcesDetailRemoveApp.path} render={(...args) => <RemoveAppModal {...args} />} />,
        store,
        initialEntry
      )
    );

    expect(wrapper.find(Text)).toHaveLength(2);
    expect(wrapper.find(Text).last().html().includes(APP1_DISPLAY_NAME)).toEqual(true);
  });

  it('renders correctly with unattached dependent applications', () => {
    initialEntry = [replaceRouteId(routes.sourcesDetailRemoveApp.path, SOURCE_ID).replace(':app_id', APP2_ID)];
    store = mockStore({
      sources: {
        ...initialStore.sources,
        entities: [
          {
            id: SOURCE_ID,
            applications: [{ id: APP2_ID, application_type_id: 2 }],
          },
        ],
      },
    });

    const wrapper = mount(
      componentWrapperIntl(
        <Route path={routes.sourcesDetailRemoveApp.path} render={(...args) => <RemoveAppModal {...args} />} />,
        store,
        initialEntry
      )
    );

    expect(wrapper.find(Text)).toHaveLength(1);
    expect(wrapper.find(Text).last().html().includes(APP2_DISPLAY_NAME)).toEqual(true);
  });

  it('calls cancel', async () => {
    const wrapper = mount(
      componentWrapperIntl(
        <Route path={routes.sourcesDetailRemoveApp.path} render={(...args) => <RemoveAppModal {...args} />} />,
        store,
        initialEntry
      )
    );

    await act(async () => {
      wrapper.find(Button).last().simulate('click');
    });
    wrapper.update();

    expect(wrapper.find(MemoryRouter).instance().history.location.pathname).toEqual(
      replaceRouteId(routes.sourcesDetail.path, SOURCE_ID)
    );
  });

  it('calls a submit', async () => {
    actions.removeApplication = jest.fn().mockImplementation(() => ({ type: 'REMOVE_APP' }));

    const wrapper = mount(
      componentWrapperIntl(
        <Route path={routes.sourcesDetailRemoveApp.path} render={(...args) => <RemoveAppModal {...args} />} />,
        store,
        initialEntry
      )
    );

    await act(async () => {
      wrapper.find(Button).at(1).simulate('click');
    });
    wrapper.update();

    expect(actions.removeApplication).toHaveBeenCalledWith(APP_ID, SOURCE_ID, SUCCESS_MSG, ERROR_MSG);
  });
});
