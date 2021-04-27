import React, {ReactElement, ReactNode, useEffect, useState} from "react";
import "./dashboard.scss";
import {useAccount, useBalance} from "../../ducks/web3";
import {fromWei} from "../../util/number";
import Button from "../../components/Button";
import AddProfileModal from "../../components/AddProfileModal";
import {useDispatch} from "react-redux";
import {fetchPaymentProfiles, useProfileById, useProfileIDs} from "../../ducks/profiles";
import ProfileCard from "../../components/ProfileCard";
import {fetchSupportedTokens} from "../../ducks/tokenData";

export default function Dashboard(): ReactElement {
    return (
        <div className="dashboard">
            {renderDashboardHeader()}
            <DashboardContent />
        </div>
    );
}

function renderDashboardHeader(): ReactNode {
    const { DAI } = useBalance();

    return (
        <div className="dashboard__header">
            <div className="dashboard__header__content">
                <div className="dashboard__header__balance-group">
                    <div className="dashboard__header__balance-group__label">
                        Current Balance
                    </div>
                    <div className="dashboard__header__balance-group__balance">
                        {fromWei(DAI)} DAI
                    </div>
                    <div className="dashboard__header__balance-group__context">
                        Available
                    </div>
                </div>
                <div className="dashboard__header__balance-group">
                    <div className="dashboard__header__balance-group__label">
                        Claimable Balance
                    </div>
                    <div className="dashboard__header__balance-group__balance">
                        {fromWei(0)} DAI
                    </div>
                    <div className="dashboard__header__balance-group__context">
                        <a>
                            Settle balance
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

function DashboardContent(): ReactElement {
    const account = useAccount();
    const [showingModal, setShowingModal] = useState(false);
    const dispatch = useDispatch();
    const profileIds = useProfileIDs();

    useEffect(() => {
        (async function onDashboardContentMount() {
            await dispatch(fetchSupportedTokens());
            await dispatch(fetchPaymentProfiles());
        })();
    }, [account]);

    return (
        <>
            <div className="dashboard__content">
                <div className="dashboard__content__header">
                    <div className="dashboard__content__header__title">
                        Payment Profiles
                    </div>
                    <Button
                        btnType="primary"
                        onClick={() => setShowingModal(true)}
                    >
                        Add Profile
                    </Button>
                </div>
                <div className="dashboard__content__body">
                    {
                        profileIds.length
                            ? (
                                <div className="dashboard__content__body__cards">
                                    { profileIds.map(id => <ProfileCard key={id} id={id} /> )}
                                </div>
                            )
                            : (
                                <div className="dashboard__content__empty-text">
                                    No Profiles
                                </div>
                            )
                    }
                </div>
            </div>
            { showingModal && <AddProfileModal onClose={() => setShowingModal(false)} /> }
        </>
    )
}