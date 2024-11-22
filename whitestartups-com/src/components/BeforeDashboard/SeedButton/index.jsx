'use client';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { Fragment, useCallback, useState } from 'react';
import { toast } from '@payloadcms/ui';
const SuccessMessage = () => (<div>
    Database seeded! You can now{' '}
    <a target="_blank" href="/">
      visit your website
    </a>
  </div>);
export const SeedButton = () => {
    const [loading, setLoading] = useState(false);
    const [seeded, setSeeded] = useState(false);
    const [error, setError] = useState(null);
    const handleClick = useCallback((e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        if (loading || seeded)
            return;
        setLoading(true);
        try {
            yield fetch('/api/seed');
            setSeeded(true);
            toast.success(<SuccessMessage />, { duration: 5000 });
        }
        catch (err) {
            setError(err);
        }
    }), [loading, seeded]);
    let message = '';
    if (loading)
        message = ' (seeding...)';
    if (seeded)
        message = ' (done!)';
    if (error)
        message = ` (error: ${error})`;
    return (<Fragment>
      <a href="/api/seed" onClick={handleClick} rel="noopener noreferrer" target="_blank">
        Seed your database
      </a>
      {message}
    </Fragment>);
};
//# sourceMappingURL=index.jsx.map