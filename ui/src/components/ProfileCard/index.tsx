import React, {ReactElement, ReactNode, ReactNodeArray, useState} from "react";
import "./profile-card.scss";
import {useProfileById, titleToText} from "../../ducks/profiles";
import Icon from "../Icon";
import copy from "copy-to-clipboard";
import Button from "../Button";
import {useHistory} from "react-router";
import {UpdateProfileModal} from "../AddProfileModal";
import DownloadThemeModal from "../DownloadThemeModal";

type Props = {
    id: string;
}

export default function ProfileCard(props: Props): ReactElement {
    const profile = useProfileById(props.id);
    const [showingModal, setShowingModal] = useState(false);
    const [showingThemeModal, setShowingThemeModal] = useState(false);

    return (
        <>
            {showingModal && (
                <UpdateProfileModal
                    id={props.id}
                    onClose={() => setShowingModal(false)}
                />
            )}
            {showingThemeModal && (
                <DownloadThemeModal
                    id={props.id}
                    onClose={() => setShowingThemeModal(false)}
                />
            )}
            <div className="profile-card">
                {renderGroup('ID', profile.id, true)}
                {renderGroup('Admin URL', profile.adminUrl, true)}
                {renderGroup('Admin API Key', profile.adminAPIKey, true)}
                {renderGroup('Payment Plans', (
                    <div className="profile-card__plans">
                        {
                            profile.plans.map(plan => (
                                <div key={plan.title} className="profile-card__plans__row">
                                    <div className="profile-card__plans__row__l">
                                        <div className="profile-card__plans__row__title">
                                            {titleToText[plan.title]}
                                        </div>
                                        <div className="profile-card__plans__row__description">
                                            {plan.description}
                                        </div>
                                    </div>
                                    <div className="profile-card__plans__row__r">
                                        {`${plan.amount} ${plan.currency}`}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                ))}
                <div className="profile-card__actions">
                    <Button
                        btnType="secondary"
                        onClick={() => setShowingThemeModal(true)}
                    >
                        Setup Theme
                    </Button>
                    <Button
                        btnType="primary"
                        onClick={() => setShowingModal(true)}
                    >
                        Edit
                    </Button>
                </div>
            </div>
        </>
    );
}

function renderGroup(label: string, value: ReactNode, copyable = false): ReactNode {
    return (
        <div className="profile-card__group">
            <div className="profile-card__group__label">
                <div className="profile-card__group__label__text">
                    {label}
                </div>
                { copyable && <Icon fa="far fa-copy" onClick={() => copy(value as string)} /> }
            </div>
            <div className="profile-card__group__value">
                {value}
            </div>
        </div>
    )
}