import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import { Tabs, Tab } from '@patternfly/react-core';
import { detailSelect } from '../../store/actions';

/**
 * Component that renders tabs for each application detail and handles clicking on each item.
 * @param {*} props onTabSelect can be used to notify parent component that detail has been selected.
 */
const ApplicationDetails = ({ onTabSelect, appList, ...props }) => {
    const { search } = useLocation();
    const history = useHistory();
    const dispatch = useDispatch();
    const searchParams = new URLSearchParams(search);
    const items = useSelector(({ entityDetails }) => entityDetails?.activeApps.filter(({ isVisible }) => isVisible !== false));
    const activeApp = useSelector(({ entityDetails }) => entityDetails?.activeApp);
    const disabledApps = useSelector(({ systemProfileStore }) => systemProfileStore?.disabledApps);
    const defaultApp = activeApp?.appName || appList?.find(({ pageId, name }) => items?.[0]?.name === (
        pageId || name))?.name || items?.[0]?.name;
    let applications = appList || items;
    // let list = appList || items;
    const [activeTabs, setActiveTabs] = useState(applications);

    useEffect(() => {
        /**
         * Initialize first inventory detail type
         */
        const appName = searchParams.get('appName');
        if (appName) {
            dispatch(detailSelect(appName));
        }
    }, []);

    useEffect(() => {
        console.log('TESTING OUT #### disabledApps: ', disabledApps);
        console.log('TESTING OUT #### original applist: ', applications);
        // setActiveTabs(disabledApps && disabledApps.length && applications.filter(app => app.name !== disabledApps[0]));
        const filteredResult = disabledApps && disabledApps.length && applications.filter(app => app.name !== disabledApps[0]);
        if (filteredResult !== 0) {
            setActiveTabs(filteredResult);
        }
        // applications = disabledApps && disabledApps.length && applications.filter(app => app.name !== disabledApps[0]);
        console.log('TESTING ### our filtered appList: ', applications);

    }, [disabledApps]);

    useEffect(() => {
        console.log('TESTING ### Updated activeTabs: ', activeTabs);
    }, [activeTabs]);

    return (
        <React.Fragment>
            {
                applications?.length > 1 &&
                <Tabs
                    {...props}
                    activeKey={ defaultApp }
                    onSelect={ (event, item) => {
                        const activeItem = applications.find(oneApp => oneApp.name === item);
                        if (onTabSelect) {
                            onTabSelect(event, item, activeItem);
                        } else {
                            searchParams.set('appName', activeItem.name);
                            history.push({ search: searchParams.toString() });
                        }

                        dispatch(detailSelect(activeItem.name));
                    } }
                    isFilled
                    className="ins-c-inventory-detail__app-tabs"
                >
                    { applications.map((item, key) => (
                        <Tab key={ key } eventKey={ item.name } title={ item.title }></Tab>
                    )) }
                </Tabs>
            }
        </React.Fragment>
    );
};

ApplicationDetails.propTypes = {
    appList: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.node,
        name: PropTypes.string.isRequired,
        pageId: PropTypes.string
    })),
    onTabSelect: PropTypes.func
};

export default ApplicationDetails;
