import { store } from '@/store';
import { Modal } from './Modal';
import { useSnapshot } from 'valtio';
import Resign from '../commandMenu/Resign';
import Give15Seconds from '../commandMenu/Give15Seconds';
import OfferDraw from '../commandMenu/OfferDraw';
import { DrawOfferAlert } from '../alerts/DrawOfferAlert';

export default function CommandMenuModal() {
  const snap = useSnapshot(store)
  return (
    <Modal
      isOpen={store.modals.commandMenu}
      onClose={() => store.modals.commandMenu = false}
    >
      <div className="space-y-4">
        {snap.gameSnapshot?.isTimed && <Give15Seconds />}
        <OfferDraw />
        <Resign />
        {snap.enemy?.offers.draw && < DrawOfferAlert />}
      </div>
    </Modal>
  );
}

